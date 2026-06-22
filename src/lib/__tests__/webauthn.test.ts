// =============================================
// MoneyShop - WebAuthn (Biometric Auth) Tests
// =============================================
// @jest-environment jsdom

import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  bufferToBase64,
  base64ToBuffer,
  createRegistrationOptions,
  createAuthenticationOptions,
} from "../webauthn";

// ─── Global Mocks ──────────────────────────────

const mockGetRandomValues = jest.fn();

beforeAll(() => {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      getRandomValues: mockGetRandomValues,
    },
    writable: true,
    configurable: true,
  });
});

beforeEach(() => {
  jest.clearAllMocks();

  // PublicKeyCredential mock (jsdom'da yoktur)
  Object.defineProperty(globalThis, "PublicKeyCredential", {
    value: {
      isUserVerifyingPlatformAuthenticatorAvailable: jest.fn(),
    },
    writable: true,
    configurable: true,
  });

  // window.location.hostname jsdom'da varsayılan olarak "localhost" gelir.
  // Eğer farklı bir değer gerekirse doğrudan atama yapılabilir.
  // NOT: Object.defineProperty ile tanımlanamaz çünkü Location.hostname configurable:false'dır.
});

// ─── isWebAuthnSupported ───────────────────────

describe("isWebAuthnSupported", () => {
  it("should return true when PublicKeyCredential exists", () => {
    expect(isWebAuthnSupported()).toBe(true);
  });

  it("should return false when PublicKeyCredential is undefined", () => {
    delete (globalThis as any).PublicKeyCredential;
    expect(isWebAuthnSupported()).toBe(false);
  });
});

// ─── isPlatformAuthenticatorAvailable ──────────

describe("isPlatformAuthenticatorAvailable", () => {
  it("should return true when platform authenticator available", async () => {
    const mockFn = jest.fn().mockResolvedValue(true);
    (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable = mockFn;

    const result = await isPlatformAuthenticatorAvailable();
    expect(result).toBe(true);
  });

  it("should return false when platform authenticator not available", async () => {
    const mockFn = jest.fn().mockResolvedValue(false);
    (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable = mockFn;

    const result = await isPlatformAuthenticatorAvailable();
    expect(result).toBe(false);
  });

  it("should return false when WebAuthn not supported", async () => {
    delete (globalThis as any).PublicKeyCredential;

    const result = await isPlatformAuthenticatorAvailable();
    expect(result).toBe(false);
  });

  it("should return false on error", async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error("Not available"));
    (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable = mockFn;

    const result = await isPlatformAuthenticatorAvailable();
    expect(result).toBe(false);
  });
});

// ─── bufferToBase64 / base64ToBuffer ───────────

describe("bufferToBase64 / base64ToBuffer", () => {
  it("should encode ArrayBuffer to base64", () => {
    const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;
    const result = bufferToBase64(buffer);
    expect(result).toBe("SGVsbG8=");
  });

  it("should decode base64 to ArrayBuffer", () => {
    const buffer = base64ToBuffer("SGVsbG8=");
    const bytes = new Uint8Array(buffer);
    expect(bytes).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
  });

  it("should round-trip correctly", () => {
    const original = new Uint8Array([1, 2, 3, 4, 255, 0, 128, 64]);
    const encoded = bufferToBase64(original.buffer);
    const decoded = base64ToBuffer(encoded);
    const decodedBytes = new Uint8Array(decoded);
    expect(decodedBytes).toEqual(original);
  });

  it("should handle empty buffer", () => {
    const empty = new Uint8Array([]).buffer;
    const encoded = bufferToBase64(empty);
    expect(encoded).toBe("");
    const decoded = base64ToBuffer("");
    expect(decoded.byteLength).toBe(0);
  });
});

// ─── createRegistrationOptions ─────────────────

describe("createRegistrationOptions", () => {
  beforeEach(() => {
    mockGetRandomValues.mockImplementation((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = i % 256;
      return arr;
    });
  });

  it("should create registration options with correct structure", async () => {
    const options = await createRegistrationOptions("user-id-123", "testuser", "Test User");

    expect(options).toMatchObject({
      rp: { id: "localhost", name: "MoneyShop" },
      user: { id: "user-id-123", name: "testuser", displayName: "Test User" },
      timeout: 60000,
      attestation: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
    });

    expect(options.challenge).toBeDefined();
    expect(typeof options.challenge).toBe("string");
    expect(options.pubKeyCredParams).toHaveLength(2);
    expect(options.pubKeyCredParams[0]).toEqual({ alg: -7, type: "public-key" });
    expect(options.pubKeyCredParams[1]).toEqual({ alg: -257, type: "public-key" });
  });

  it("should generate different challenges each time", async () => {
    let callCount = 0;
    mockGetRandomValues.mockImplementation((arr: Uint8Array) => {
      callCount++;
      arr.fill(callCount);
      return arr;
    });

    const opts1 = await createRegistrationOptions("uid-1", "user1", "User 1");
    const opts2 = await createRegistrationOptions("uid-1", "user1", "User 1");

    expect(opts1.challenge).not.toBe(opts2.challenge);
  });
});

// ─── createAuthenticationOptions ───────────────

describe("createAuthenticationOptions", () => {
  beforeEach(() => {
    mockGetRandomValues.mockImplementation((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = i % 256;
      return arr;
    });
  });

  it("should create authentication options without credentials", async () => {
    const options = await createAuthenticationOptions();

    expect(options).toMatchObject({
      timeout: 60000,
      rpId: "localhost",
      userVerification: "required",
    });
    expect(options.challenge).toBeDefined();
    expect(options.allowCredentials).toBeUndefined();
  });

  it("should create authentication options with credentials", async () => {
    const options = await createAuthenticationOptions([
      { id: "credential-id-1" },
      { id: "credential-id-2" },
    ]);

    expect(options.allowCredentials).toHaveLength(2);
    expect(options.allowCredentials![0]).toEqual({
      id: "credential-id-1",
      type: "public-key",
      transports: ["internal"],
    });
  });
});
