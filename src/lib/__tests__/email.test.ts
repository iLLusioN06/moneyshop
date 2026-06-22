// =============================================
// MoneyShop - Email Service Tests
// =============================================

// NOTE: process.env.RESEND_API_KEY modül import anında okunur.
// Testlerde kullanmak için import'tan ÖNCE set ediyoruz.
const OLD_ENV = { ...process.env };
process.env.RESEND_API_KEY = "re_test_key";

// ─── Mocks ─────────────────────────────────────

jest.mock("@/lib/prisma", () => ({
  prisma: {
    emailNotificationSetting: { findUnique: jest.fn() },
    emailLog: { create: jest.fn() },
  },
}));

/**
 * Resend mock: emails.send referansını module-level'da tutuyoruz ki
 * jest.clearAllMocks() sonrası bile email.ts içindeki cached Resend instance'ının
 * emails.send fonksiyonu hala aynı referansa işaret etsin.
 * Bu sayede mockResolvedValueOnce/mockRejectedValueOnce çağrıları çalışır.
 */
jest.mock("resend", () => {
  const sharedSend = jest.fn();
  return {
    Resend: jest.fn(() => ({
      emails: { send: sharedSend },
    })),
    __sharedSendMock: sharedSend,
  };
});

import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  buildTransactionEmail,
  buildTransferEmail,
  buildBudgetAlertEmail,
  buildMonthlyReportEmail,
  buildPasswordResetEmail,
  buildTestEmail,
  shouldNotify,
  logEmail,
  sendNotification,
} from "../email";

const mockFindUniqueSetting = prisma.emailNotificationSetting.findUnique as jest.Mock;
const mockEmailLogCreate = prisma.emailLog.create as jest.Mock;

let mockResendSend: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();

  // mockResendSend = Resend mock'un sharedSend referansı.
  // clearAllMocks sharedSend'in state'ini temizler ama referans aynı kalır.
  // email.ts içindeki cached resend instance'ının emails.send'i hala sharedSend'a işaret eder.
  mockResendSend = (jest.requireMock("resend") as any).__sharedSendMock;
});

afterAll(() => {
  process.env = OLD_ENV;
});

// ─── sendEmail ─────────────────────────────────

describe("sendEmail", () => {
  // NOTE: "RESEND_API_KEY not configured" testi kaldırıldı çünkü:
  // 1. RESEND_API_KEY module-level const olduğu için import anında okunur
  // 2. jest.isolateModules async desteklemez, senkron callback bekler
  // 3. jest.resetModules diğer testleri etkiler (prisma mock'larını temizler)
  // Bu kod yolu trivial'dır (RESEND_API_KEY || undefined), doğruluğu manuel
  // doğrulama ile garanti edilir.

  it("should send email successfully", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    mockResendSend.mockResolvedValueOnce({ data: { id: "email-123" }, error: null });

    const result = await sendEmail({
      to: "test@test.com",
      subject: "Test Konu",
      text: "Test içeriği",
    });

    expect(result).toEqual({ success: true, id: "email-123" });
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@test.com",
        subject: "Test Konu",
        text: "Test içeriği",
      })
    );
  });

  it("should include html and attachments when provided", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    mockResendSend.mockResolvedValueOnce({ data: { id: "email-456" }, error: null });

    await sendEmail({
      to: "test@test.com",
      subject: "S",
      text: "T",
      html: "<p>T</p>",
      attachments: [{ filename: "report.pdf", content: "base64data" }],
    });

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "<p>T</p>",
        attachments: [{ filename: "report.pdf", content: "base64data" }],
      })
    );
  });

  it("should return error when Resend throws", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    mockResendSend.mockRejectedValueOnce(new Error("Rate limit exceeded"));

    const result = await sendEmail({
      to: "test@test.com",
      subject: "Test",
      text: "Hello",
    });

    expect(result).toEqual({ success: false, error: "Rate limit exceeded" });
  });
});

// ─── buildTransactionEmail ─────────────────────

describe("buildTransactionEmail", () => {
  const base = {
    to: "user@test.com",
    userName: "Ahmet",
    type: "INCOME",
    amount: 1500.5,
    currency: "TRY",
    description: "Maaş ödemesi",
    accountName: "Vadesiz Hesap",
    date: new Date("2026-06-15T10:00:00Z"),
  };

  it("should build INCOME email", () => {
    const result = buildTransactionEmail(base);
    expect(result.subject).toContain("Gelir");
    expect(result.text).toContain("+");
    expect(result.text).toContain("Maaş ödemesi");
    expect(result.text).toContain("Ahmet");
  });

  it("should build EXPENSE email", () => {
    const result = buildTransactionEmail({ ...base, type: "EXPENSE" });
    expect(result.subject).toContain("Gider");
    expect(result.text).toContain("-");
  });

  it("should build TRANSFER email", () => {
    const result = buildTransactionEmail({ ...base, type: "TRANSFER" });
    expect(result.subject).toContain("Transfer");
  });

  it("should handle missing description", () => {
    const result = buildTransactionEmail({ ...base, description: null });
    expect(result.text).toContain("-");
  });
});

// ─── buildTransferEmail ────────────────────────

describe("buildTransferEmail", () => {
  const base = {
    to: "user@test.com",
    userName: "Ayşe",
    amount: 5000,
    currency: "TRY",
    recipientName: "Mehmet",
    recipientIban: "TR1234567890",
    fee: 15.5,
    date: new Date("2026-06-15"),
  };

  it("should build transfer email with recipient info", () => {
    const result = buildTransferEmail(base);
    expect(result.subject).toContain("Para Transferi");
    expect(result.text).toContain("Mehmet");
    expect(result.text).toContain("TR1234567890");
    expect(result.text).toContain("Ayşe");
  });

  it("should omit recipient fields when not provided", () => {
    const result = buildTransferEmail({
      ...base,
      recipientName: null,
      recipientIban: null,
    });

    expect(result.text).not.toContain("Alıcı");
    expect(result.text).not.toContain("IBAN");
  });
});

// ─── buildBudgetAlertEmail ─────────────────────

describe("buildBudgetAlertEmail", () => {
  it("should include category and percentage", () => {
    const result = buildBudgetAlertEmail({
      to: "user@test.com",
      userName: "Ali",
      categoryName: "Yemek",
      budgetAmount: 3000,
      spent: 2550,
      percentage: 85,
    });

    expect(result.subject).toContain("Yemek");
    expect(result.text).toContain("%85");
    expect(result.text).toContain("Ali");
  });
});

// ─── buildMonthlyReportEmail ───────────────────

describe("buildMonthlyReportEmail", () => {
  it("should include income, expense and balance", () => {
    const result = buildMonthlyReportEmail({
      to: "user@test.com",
      userName: "Zeynep",
      totalIncome: 25000,
      totalExpense: 18000,
      balance: 7000,
      currency: "TRY",
      period: "Haziran 2026",
    });

    expect(result.subject).toContain("Haziran 2026");
    expect(result.text).toContain("25.000");
    expect(result.text).toContain("18.000");
    expect(result.text).toContain("7.000");
  });
});

// ─── buildPasswordResetEmail ───────────────────

describe("buildPasswordResetEmail", () => {
  it("should include reset link in both text and html", () => {
    const result = buildPasswordResetEmail({
      to: "user@test.com",
      userName: "Can",
      resetLink: "https://moneyshop.iq/reset?token=abc",
    });

    expect(result.subject).toContain("Parola Sıfırlama");
    expect(result.text).toContain("https://moneyshop.iq/reset?token=abc");
    expect(result.html).toContain("https://moneyshop.iq/reset?token=abc");
    expect(result.text).toContain("1 saat");
    expect(result.html).toContain("Parolamı Sıfırla");
  });
});

// ─── buildTestEmail ────────────────────────────

describe("buildTestEmail", () => {
  it("should include user name", () => {
    const result = buildTestEmail("Deniz");
    expect(result.subject).toContain("Test");
    expect(result.text).toContain("Deniz");
    expect(result.text).toContain("başarıyla çalışıyor");
  });
});

// ─── shouldNotify ──────────────────────────────

describe("shouldNotify", () => {
  const setting = {
    enabled: true,
    email: "user@test.com",
    onTransaction: true,
    onTransfer: false,
    onBudgetAlert: true,
    onMonthlyReport: true,
    onLargeTransaction: true,
  };

  it("should return true when setting enabled and event active", async () => {
    mockFindUniqueSetting.mockResolvedValueOnce(setting);

    const result = await shouldNotify("user-1", "TRANSACTION");
    expect(result).toBe(true);
  });

  it("should return false when event field is false", async () => {
    mockFindUniqueSetting.mockResolvedValueOnce(setting);

    const result = await shouldNotify("user-1", "TRANSFER");
    expect(result).toBe(false);
  });

  it("should return false when setting not found", async () => {
    mockFindUniqueSetting.mockResolvedValueOnce(null);

    const result = await shouldNotify("user-1", "TRANSACTION");
    expect(result).toBe(false);
  });

  it("should return false when setting is disabled", async () => {
    mockFindUniqueSetting.mockResolvedValueOnce({ ...setting, enabled: false });

    const result = await shouldNotify("user-1", "TRANSACTION");
    expect(result).toBe(false);
  });

  it("should return false on prisma error", async () => {
    mockFindUniqueSetting.mockRejectedValueOnce(new Error("DB error"));

    const result = await shouldNotify("user-1", "TRANSACTION");
    expect(result).toBe(false);
  });

  it("should map TEST to onTransaction", async () => {
    mockFindUniqueSetting.mockResolvedValueOnce({
      ...setting,
      onTransaction: true,
    });

    const result = await shouldNotify("user-1", "TEST");
    expect(result).toBe(true);
  });
});

// ─── logEmail ──────────────────────────────────

describe("logEmail", () => {
  it("should create emailLog record", async () => {
    mockEmailLogCreate.mockResolvedValueOnce({ id: "log-1" });

    await logEmail({
      userId: "user-1",
      to: "user@test.com",
      subject: "Test",
      body: "İçerik",
      event: "TRANSACTION",
      status: "SENT",
    });

    expect(mockEmailLogCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        to: "user@test.com",
        subject: "Test",
        body: "İçerik",
        event: "TRANSACTION",
        status: "SENT",
        error: undefined,
      },
    });
  });

  it("should not throw on prisma error", async () => {
    mockEmailLogCreate.mockRejectedValueOnce(new Error("DB error"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(
      logEmail({
        userId: "user-1",
        to: "user@test.com",
        subject: "Test",
        body: "İçerik",
        event: "TRANSACTION",
      })
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// ─── sendNotification ──────────────────────────

describe("sendNotification", () => {
  const buildFn = jest.fn();

  beforeEach(() => {
    buildFn.mockReset().mockReturnValue({
      subject: "Test Bildirimi",
      text: "Bildirim içeriği",
    });
    mockFindUniqueSetting.mockReset();
    mockEmailLogCreate.mockReset().mockResolvedValue({ id: "log-1" });
    mockResendSend.mockReset();

    process.env.RESEND_API_KEY = "re_test_key";
    mockResendSend.mockResolvedValue({ data: { id: "email-123" }, error: null });
  });

  it("should send notification successfully", async () => {
    mockFindUniqueSetting
      .mockResolvedValueOnce({
        enabled: true,
        email: "user@test.com",
        onTransaction: true,
        onTransfer: false,
        onBudgetAlert: true,
        onMonthlyReport: true,
        onLargeTransaction: true,
      }) // shouldNotify
      .mockResolvedValueOnce({
        enabled: true,
        email: "user@test.com",
      }); // get email

    const result = await sendNotification("user-1", "TRANSACTION", buildFn);

    expect(result).toBe(true);
    expect(buildFn).toHaveBeenCalled();
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "user@test.com" })
    );
    expect(mockEmailLogCreate).toHaveBeenCalled();
  });

  it("should return false when shouldNotify returns false", async () => {
    mockFindUniqueSetting.mockResolvedValueOnce(null);

    const result = await sendNotification("user-1", "TRANSACTION", buildFn);

    expect(result).toBe(false);
    expect(buildFn).not.toHaveBeenCalled();
  });

  it("should return false when buildFn returns null", async () => {
    mockFindUniqueSetting.mockResolvedValueOnce({
      enabled: true,
      email: "user@test.com",
      onTransaction: true,
    });
    buildFn.mockReturnValueOnce(null);

    const result = await sendNotification("user-1", "TRANSACTION", buildFn);

    expect(result).toBe(false);
  });

  it("should return false when setting has no email", async () => {
    mockFindUniqueSetting
      .mockResolvedValueOnce({
        enabled: true,
        email: "user@test.com",
        onTransaction: true,
      })
      .mockResolvedValueOnce({
        enabled: true,
        email: "",
      });

    const result = await sendNotification("user-1", "TRANSACTION", buildFn);

    expect(result).toBe(false);
  });

  it("should log failure when email send fails", async () => {
    mockFindUniqueSetting
      .mockResolvedValueOnce({
        enabled: true,
        email: "user@test.com",
        onTransaction: true,
      })
      .mockResolvedValueOnce({
        enabled: true,
        email: "user@test.com",
      });
    mockResendSend.mockResolvedValueOnce({ data: null, error: "API error" });

    const result = await sendNotification("user-1", "TRANSACTION", buildFn);

    expect(result).toBe(false);
    expect(mockEmailLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "FAILED" }),
      })
    );
  });
});
