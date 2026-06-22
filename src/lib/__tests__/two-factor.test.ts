// =============================================
// MoneyShop - Two-Factor Authentication Tests
// =============================================

// ─── Mocks ─────────────────────────────────────

// NOTE: process.env.AUTH_SECRET, crypto, otplib, prisma, sms, redis
// tümü import zamanında okunur. Bu yüzden mock'lar import'tan ÖNCE tanımlanır.

const OLD_ENV = { ...process.env };
process.env.AUTH_SECRET = "test-auth-secret-for-unit-tests-abcdef123456";

// Helper: chainable { update, digest } mock for createHash
function chainableHash(digestValue: string | Buffer) {
  return {
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue(digestValue),
  };
}

jest.mock("crypto", () => ({
  createHash: jest.fn(() => chainableHash(Buffer.alloc(32, 0x12))),
  randomBytes: jest.fn(() => Buffer.alloc(16, 0xab)),
  randomInt: jest.fn(() => 5),
  createCipheriv: jest.fn(() => ({
    update: jest.fn().mockReturnValue("abababababababababababababababab"),
    final: jest.fn().mockReturnValue("cdcd"),
    getAuthTag: jest.fn(() => Buffer.alloc(16, 0xcd)),
  })),
  createDecipheriv: jest.fn(() => ({
    update: jest.fn().mockReturnValue("plaintext"),
    final: jest.fn().mockReturnValue(""),
    setAuthTag: jest.fn(),
  })),
}));

/**
 * OTP verify mock'u module seviyesinde tutuyoruz ki jest.clearAllMocks() sonrası
 * referans kaybolmasın. _verifyMock üzerinden test içinde kontrol edebiliriz.
 */
jest.mock("otplib", () => {
  const _verify = jest.fn().mockResolvedValue({ valid: true });
  return {
    OTP: jest.fn(() => ({
      generateSecret: jest.fn().mockReturnValue("JBSWY3DPEHPK3PXP"),
      generateURI: jest.fn().mockReturnValue("otpauth://totp/MoneyShop:user@test.com?secret=TEST&issuer=MoneyShop"),
      verify: _verify,
    })),
    _verifyMock: _verify,
  };
});

jest.mock("../prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
  },
}));

jest.mock("../sms", () => ({
  hashSmsCode: jest.fn((code: string) => `mocked-hash-${code}`),
}));

jest.mock("../redis", () => ({
  redis: null,
}));

import crypto from "crypto";
import { prisma } from "../prisma";
import {
  encryptSecret,
  decryptSecret,
  generateTotpSecret,
  generateTotpUri,
  verifyTotpToken,
  verifyTotpTokenRaw,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  createPendingAuthToken,
  getPendingAuth,
  consumePendingAuth,
  clearPendingAuthStore,
  stopPendingAuthCleanup,
  storeSmsCode,
  verifySmsCode,
  clearSmsCode,
  stopSmsCleanup,
  getUserTwoFactorStatus,
} from "../two-factor";

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreateHash = crypto.createHash as jest.Mock;
const mockRandomBytes = crypto.randomBytes as jest.Mock;
const mockRandomInt = crypto.randomInt as jest.Mock;
const mockCreateCipheriv = crypto.createCipheriv as jest.Mock;
const mockCreateDecipheriv = crypto.createDecipheriv as jest.Mock;

afterAll(() => {
  process.env = OLD_ENV;
});

beforeEach(() => {
  jest.clearAllMocks();
  clearPendingAuthStore();
});

// ─── Encryption / Decryption ───────────────────

describe("encryptSecret / decryptSecret", () => {
  it("should encrypt and decrypt successfully (round trip)", () => {
    // crypto mock zaten varsayılan chainable değerler döndürür
    const encrypted = encryptSecret("my-totp-secret");
    expect(encrypted).toMatch(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);
    expect(encrypted.split(":")).toHaveLength(3);

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe("plaintext");
  });

  it("should return null for invalid encrypted format", () => {
    expect(decryptSecret("invalid")).toBeNull();
    expect(decryptSecret("a:b")).toBeNull();
  });

  it("should return null when decryption fails", () => {
    mockCreateDecipheriv.mockImplementationOnce(() => {
      throw new Error("Decipher error");
    });

    const result = decryptSecret("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb:cccccc");
    expect(result).toBeNull();
  });
});

// ─── TOTP ──────────────────────────────────────

describe("generateTotpSecret", () => {
  it("should return generated secret from otplib", () => {
    const secret = generateTotpSecret();
    expect(secret).toBe("JBSWY3DPEHPK3PXP");
  });
});

describe("generateTotpUri", () => {
  it("should generate otpauth URI", () => {
    const uri = generateTotpUri("user@test.com", "TEST");
    expect(uri).toContain("otpauth://");
    expect(uri).toContain("MoneyShop");
  });
});

describe("verifyTotpToken", () => {
  function setupDecrypt(returnValue: string) {
    mockCreateDecipheriv.mockImplementation(() => ({
      update: jest.fn().mockReturnValue(returnValue),
      final: jest.fn().mockReturnValue(""),
      setAuthTag: jest.fn(),
    }));
  }

  it("should return true for valid token", async () => {
    setupDecrypt("real-secret");
    // otplib.verify mock default: { valid: true }

    const result = await verifyTotpToken("123456", "iv:authTag:ciphertext");
    expect(result).toBe(true);
  });

  it("should return false for invalid token", async () => {
    setupDecrypt("real-secret");
    const otplibMock = jest.requireMock("otplib") as { _verifyMock: jest.Mock };
    otplibMock._verifyMock.mockResolvedValueOnce({ valid: false });

    const result = await verifyTotpToken("000000", "iv:authTag:ciphertext");
    expect(result).toBe(false);
  });

  it("should return false when decrypt fails", async () => {
    mockCreateDecipheriv.mockImplementationOnce(() => {
      throw new Error("Decrypt error");
    });

    const result = await verifyTotpToken("000000", "iv:authTag:ciphertext");
    expect(result).toBe(false);
  });
});

describe("verifyTotpTokenRaw", () => {
  it("should verify with raw (unencrypted) secret", async () => {
    const result = await verifyTotpTokenRaw("123456", "raw-secret");
    expect(result).toBe(true);
  });

  it("should return false on verify error", async () => {
    const otplibMock = jest.requireMock("otplib") as { _verifyMock: jest.Mock };
    otplibMock._verifyMock.mockRejectedValueOnce(new Error("Invalid token"));

    const result = await verifyTotpTokenRaw("123456", "raw-secret");
    expect(result).toBe(false);
  });
});

// ─── Backup Codes ──────────────────────────────

describe("hashBackupCode", () => {
  it("should hash backup code with SHA-256", () => {
    mockCreateHash.mockReturnValueOnce(chainableHash("abc123hash"));

    const hash = hashBackupCode("ABCD-1234");
    expect(mockCreateHash).toHaveBeenCalledWith("sha256");
    expect(hash).toBe("abc123hash");
  });
});

describe("generateBackupCodes", () => {
  function setupHash(digest: string) {
    mockCreateHash.mockReturnValue(chainableHash(digest));
  }

  it("should generate 10 backup codes", () => {
    setupHash("mockhash");
    mockRandomInt.mockReturnValue(7);

    const result = generateBackupCodes();

    expect(result.plain).toHaveLength(10);
    expect(result.hashed).toBeDefined();
    expect(result.plain[0]).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it("should hash all generated codes", () => {
    setupHash("mockhash");
    mockRandomInt.mockReturnValue(5);

    const result = generateBackupCodes();
    const hashes = result.hashed.split(",");
    expect(hashes).toHaveLength(10);
  });
});

describe("verifyBackupCode", () => {
  function setupHash(digest: string) {
    mockCreateHash.mockReturnValue(chainableHash(digest));
  }

  it("should return remaining codes on successful match", () => {
    setupHash("hash-A");
    const hash1 = hashBackupCode("ABCD-1234");
    setupHash("hash-B");
    const hash2 = hashBackupCode("WXYZ-5678");

    const stored = `${hash1},${hash2}`;

    setupHash("hash-A");
    const result = verifyBackupCode("ABCD-1234", stored);

    expect(result).toBe("hash-B");
  });

  it("should consume used code and return empty string for last code", () => {
    setupHash("hash-X");
    const hash = hashBackupCode("ONLY-CODE");

    setupHash("hash-X");
    const result = verifyBackupCode("ONLY-CODE", hash);
    expect(result).toBe("");
  });

  it("should return null when no code matches", () => {
    setupHash("hash-A");
    const hash1 = hashBackupCode("ABCD-1234");

    setupHash("hash-OTHER");
    const result = verifyBackupCode("WRONG-CODE", hash1);
    expect(result).toBeNull();
  });
});

// ─── Pending Auth Token (in-memory) ────────────

describe("Pending Auth Token (in-memory)", () => {
  function makeDeterministicBytes() {
    mockRandomBytes.mockReturnValue(Buffer.alloc(32, 0x42));
  }

  it("should create and retrieve a pending auth token", async () => {
    makeDeterministicBytes();

    const token = await createPendingAuthToken({
      userId: "user-1",
      email: "user@test.com",
      name: "Test User",
      role: "USER",
      image: null,
      method: "AUTHENTICATOR",
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const retrieved = await getPendingAuth(token);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.userId).toBe("user-1");
    expect(retrieved!.email).toBe("user@test.com");
    expect(retrieved!.method).toBe("AUTHENTICATOR");
  });

  it("should consume (one-time use) a pending auth token", async () => {
    mockRandomBytes.mockReturnValue(Buffer.alloc(32, 0x43));

    const token = await createPendingAuthToken({
      userId: "user-2",
      email: "user2@test.com",
      name: null,
      role: "USER",
      image: null,
      method: "SMS",
    });

    const consumed = await consumePendingAuth(token);
    expect(consumed).not.toBeNull();
    expect(consumed!.userId).toBe("user-2");

    const again = await consumePendingAuth(token);
    expect(again).toBeNull();
  });

  it("should return null for non-existent token", async () => {
    const result = await getPendingAuth("non-existent-token");
    expect(result).toBeNull();
  });
});

// ─── SMS 2FA Code (in-memory) ──────────────────

describe("SMS 2FA Code (in-memory)", () => {
  it("should store and verify SMS code", async () => {
    await storeSmsCode("user-1", "482615");
    const result = await verifySmsCode("user-1", "482615");
    expect(result).toBe(true);
  });

  it("should fail for wrong code", async () => {
    await storeSmsCode("user-1", "482615");
    const result = await verifySmsCode("user-1", "999999");
    expect(result).toBe(false);
  });

  it("should consume code after successful verification", async () => {
    await storeSmsCode("user-1", "482615");
    await verifySmsCode("user-1", "482615");
    const again = await verifySmsCode("user-1", "482615");
    expect(again).toBe(false);
  });

  it("should clear stored SMS code", async () => {
    await storeSmsCode("user-1", "482615");
    clearSmsCode("user-1");
    const result = await verifySmsCode("user-1", "482615");
    expect(result).toBe(false);
  });
});

// ─── Cleanup Helpers ───────────────────────────

describe("Cleanup helpers", () => {
  it("should stop pending auth cleanup without error", () => {
    expect(() => stopPendingAuthCleanup()).not.toThrow();
  });

  it("should stop SMS cleanup without error", () => {
    expect(() => stopSmsCleanup()).not.toThrow();
  });

  it("should clear pending auth store", async () => {
    mockRandomBytes.mockReturnValue(Buffer.alloc(32, 0xaa));
    const token = await createPendingAuthToken({
      userId: "user-1",
      email: "user@test.com",
      name: null,
      role: "USER",
      image: null,
      method: "AUTHENTICATOR",
    });

    clearPendingAuthStore();

    const result = await getPendingAuth(token);
    expect(result).toBeNull();
  });
});

// ─── getUserTwoFactorStatus ────────────────────

describe("getUserTwoFactorStatus", () => {
  it("should return enabled status for 2FA user", async () => {
    mockFindUnique.mockResolvedValueOnce({
      twoFactorEnabled: true,
      twoFactorMethod: "AUTHENTICATOR",
      twoFactorSecret: "encrypted-secret",
    });

    const status = await getUserTwoFactorStatus("user-1");
    expect(status.enabled).toBe(true);
    expect(status.method).toBe("AUTHENTICATOR");
    expect(status.isSetupComplete).toBe(true);
  });

  it("should return disabled when user not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const status = await getUserTwoFactorStatus("user-1");
    expect(status.enabled).toBe(false);
    expect(status.method).toBeNull();
    expect(status.isSetupComplete).toBe(false);
  });

  it("should return incomplete when enabled but no method", async () => {
    mockFindUnique.mockResolvedValueOnce({
      twoFactorEnabled: true,
      twoFactorMethod: null,
      twoFactorSecret: null,
    });

    const status = await getUserTwoFactorStatus("user-1");
    expect(status.enabled).toBe(true);
    expect(status.method).toBeNull();
    expect(status.isSetupComplete).toBe(false);
  });
});
