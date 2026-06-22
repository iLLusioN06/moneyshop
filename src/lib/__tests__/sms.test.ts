// =============================================
// MoneyShop - SMS Service Tests
// =============================================

// ─── Mocks ─────────────────────────────────────

// NOTE: sms.ts module-level sabitleri import anında process.env'den okur.
// Twilio modunu test edebilmek için env var'ları import'tan ÖNCE set ediyoruz.
const OLD_ENV = { ...process.env };
process.env.TWILIO_ACCOUNT_SID = "test-sid";
process.env.TWILIO_AUTH_TOKEN = "test-token";
process.env.TWILIO_PHONE_NUMBER = "+15551234567";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    smsLog: { create: jest.fn() },
  },
}));

jest.mock("twilio", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: { create: jest.fn() },
  })),
}));

import { prisma } from "@/lib/prisma";
import {
  generateSmsCode,
  hashSmsCode,
  sendSms,
  buildVerificationSms,
  shouldNotifyBySms,
  logSms,
  sendSmsNotification,
} from "../sms";

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockSmsLogCreate = prisma.smsLog.create as jest.Mock;

let twilioConstructor: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();

  // Re-wire twilio constructor after clearAllMocks
  twilioConstructor = jest.fn(() => ({
    messages: { create: jest.fn() },
  }));
  (jest.requireMock("twilio") as any).default = twilioConstructor;
});

afterAll(() => {
  process.env = OLD_ENV;
});

// ─── generateSmsCode ───────────────────────────

describe("generateSmsCode", () => {
  it("should return a 6-digit string", () => {
    const code = generateSmsCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("should produce different codes on successive calls", () => {
    const codes = new Set(Array.from({ length: 5 }, () => generateSmsCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});

// ─── hashSmsCode ───────────────────────────────

describe("hashSmsCode", () => {
  it("should return SHA-256 hex hash", () => {
    const hash = hashSmsCode("123456");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should be deterministic", () => {
    expect(hashSmsCode("123456")).toBe(hashSmsCode("123456"));
  });

  it("should produce different hashes for different inputs", () => {
    expect(hashSmsCode("123456")).not.toBe(hashSmsCode("654321"));
  });
});

// ─── buildVerificationSms ──────────────────────

describe("buildVerificationSms", () => {
  it("should include the code in the message", () => {
    const msg = buildVerificationSms("482615");
    expect(msg).toContain("482615");
  });

  it("should mention 5-minute validity", () => {
    const msg = buildVerificationSms("482615");
    expect(msg).toContain("5 dakika");
  });

  it("should use custom app name", () => {
    const msg = buildVerificationSms("482615", "MyApp");
    expect(msg).toContain("MyApp");
  });

  it("should default to MoneyShop", () => {
    const msg = buildVerificationSms("482615");
    expect(msg).toContain("MoneyShop");
  });
});

// ─── sendSms (Twilio mod) ──────────────────────

// NOTE: getTwilioClient() twilioClient değişkenini module-level'da cache'ler.
// jest.isolateModules ile her test için taze bir module yükleyip cache'i temizliyoruz.
describe("sendSms (Twilio mode)", () => {
  function setupTwilioMock(createImpl: () => jest.Mock) {
    const mockCreate = createImpl();
    const twilioMock = jest.requireMock("twilio") as any;
    twilioMock.default = jest.fn(() => ({
      messages: { create: mockCreate },
    }));
    return mockCreate;
  }

  it("should send via Twilio and return success", async () => {
    const mockCreate = setupTwilioMock(() =>
      jest.fn().mockResolvedValue({ sid: "tw-sid-123" }),
    );

    await jest.isolateModules(async () => {
      const { sendSms: send } = await import("../sms");

      const result = await send("+905551234567", "Merhaba");

      expect(result.success).toBe(true);
      expect(result.sid).toBe("tw-sid-123");
      expect(mockCreate).toHaveBeenCalledWith({
        body: "Merhaba",
        from: "+15551234567",
        to: "+905551234567",
      });
    });
  });

  it("should return error when Twilio throws", async () => {
    const mockCreate = setupTwilioMock(() =>
      jest.fn().mockRejectedValue(new Error("Twilio error: 400")),
    );

    await jest.isolateModules(async () => {
      const { sendSms: send } = await import("../sms");

      const result = await send("+905551234567", "Merhaba");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Twilio error: 400");
    });
  });
});

// ─── shouldNotifyBySms ─────────────────────────

describe("shouldNotifyBySms", () => {
  it("should return true when user has phone", async () => {
    mockFindUnique.mockResolvedValueOnce({ phone: "+905551234567" });

    const result = await shouldNotifyBySms("user-1", "VERIFICATION");
    expect(result).toBe(true);
  });

  it("should return false when user not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const result = await shouldNotifyBySms("user-1", "VERIFICATION");
    expect(result).toBe(false);
  });

  it("should return false when user has no phone", async () => {
    mockFindUnique.mockResolvedValueOnce({ phone: null });

    const result = await shouldNotifyBySms("user-1", "VERIFICATION");
    expect(result).toBe(false);
  });

  it("should return false on prisma error", async () => {
    mockFindUnique.mockRejectedValueOnce(new Error("DB error"));

    const result = await shouldNotifyBySms("user-1", "VERIFICATION");
    expect(result).toBe(false);
  });
});

// ─── logSms ────────────────────────────────────

describe("logSms", () => {
  it("should create smsLog record", async () => {
    mockSmsLogCreate.mockResolvedValueOnce({ id: "log-1" });

    await logSms({
      userId: "user-1",
      phone: "+905551234567",
      message: "Test",
      event: "VERIFICATION",
      status: "SENT",
      sid: "sid-123",
    });

    expect(mockSmsLogCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        phone: "+905551234567",
        message: "Test",
        event: "VERIFICATION",
        status: "SENT",
        sid: "sid-123",
        error: undefined,
      },
    });
  });

  it("should fallback to console on prisma error", async () => {
    mockSmsLogCreate.mockRejectedValueOnce(new Error("Table not found"));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await logSms({
      userId: "user-1",
      phone: "+905551234567",
      message: "Test",
      event: "TRANSACTION",
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// ─── sendSmsNotification ───────────────────────

describe("sendSmsNotification", () => {
  const buildFn = jest.fn();

  beforeEach(() => {
    buildFn.mockReset().mockReturnValue("Doğrulama kodunuz: 123456");
    mockFindUnique.mockReset();
    mockSmsLogCreate.mockReset().mockResolvedValue({ id: "log-1" });
  });

  it("should send notification successfully", async () => {
    mockFindUnique
      .mockResolvedValueOnce({ phone: "+905551234567" })  // shouldNotifyBySms
      .mockResolvedValueOnce({ phone: "+905551234567" });  // sendSmsNotification

    const result = await sendSmsNotification("user-1", "VERIFICATION", buildFn);

    expect(result).toBe(true);
    expect(mockFindUnique).toHaveBeenCalledTimes(2);
    expect(mockSmsLogCreate).toHaveBeenCalledTimes(1);
  });

  it("should return false when shouldNotifyBySms fails", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const result = await sendSmsNotification("user-1", "VERIFICATION", buildFn);

    expect(result).toBe(false);
    expect(buildFn).not.toHaveBeenCalled();
  });

  it("should return false when buildFn returns null", async () => {
    mockFindUnique.mockResolvedValueOnce({ phone: "+905551234567" });
    buildFn.mockReturnValueOnce(null);

    const result = await sendSmsNotification("user-1", "VERIFICATION", buildFn);

    expect(result).toBe(false);
  });

  it("should return false when user has no phone", async () => {
    mockFindUnique
      .mockResolvedValueOnce({ phone: "+905551234567" })
      .mockResolvedValueOnce({ phone: null });

    const result = await sendSmsNotification("user-1", "VERIFICATION", buildFn);

    expect(result).toBe(false);
  });
});
