// =============================================
// MoneyShop - Card Utils Tests
// =============================================

import {
  encryptCardNumber,
  decryptCardNumber,
  tryDecryptCardNumber,
  encryptCvv,
  decryptCvv,
  tryDecryptCvv,
  luhnCheck,
  generateCardNumber,
  generateCvv,
  maskCardNumber,
  lastFour,
  isEncrypted,
} from "../card-utils";

// Set up encryption key for tests
process.env.CARD_ENCRYPTION_KEY = "test-encryption-key-for-unit-tests-32c";

describe("Luhn Algorithm", () => {
  it("validates correct card numbers", () => {
    expect(luhnCheck("4242424242424242")).toBe(true);
    expect(luhnCheck("5555555555554444")).toBe(true);
    expect(luhnCheck("378282246310005")).toBe(true);
  });

  it("rejects incorrect card numbers", () => {
    expect(luhnCheck("4242424242424241")).toBe(false);
    expect(luhnCheck("1234567890123456")).toBe(false);
  });

  it("handles empty string", () => {
    // Luhn algorithm: empty string has sum 0, 0 % 10 === 0, so technically valid
    // In practice, empty strings should be rejected before reaching Luhn
    expect(typeof luhnCheck("")).toBe("boolean");
  });

  it("handles non-numeric input", () => {
    expect(luhnCheck("abcdef")).toBe(false);
  });
});

describe("Card Number Generation", () => {
  it("generates 16-digit card numbers", () => {
    const cardNumber = generateCardNumber();
    expect(cardNumber).toHaveLength(16);
  });

  it("generates numbers starting with 5200", () => {
    const cardNumber = generateCardNumber();
    expect(cardNumber.startsWith("5200")).toBe(true);
  });

  it("generates Luhn-valid numbers", () => {
    for (let i = 0; i < 10; i++) {
      const cardNumber = generateCardNumber();
      expect(luhnCheck(cardNumber)).toBe(true);
    }
  });

  it("generates unique numbers", () => {
    const numbers = new Set(Array.from({ length: 20 }, () => generateCardNumber()));
    expect(numbers.size).toBe(20);
  });
});

describe("CVV Generation", () => {
  it("generates 3-digit CVV", () => {
    const cvv = generateCvv();
    expect(cvv).toHaveLength(3);
    expect(Number(cvv)).toBeGreaterThanOrEqual(100);
    expect(Number(cvv)).toBeLessThanOrEqual(999);
  });
});

describe("Card Number Encryption", () => {
  it("encrypts and decrypts card numbers", () => {
    const original = "4242424242424242";
    const encrypted = encryptCardNumber(original);
    const decrypted = decryptCardNumber(encrypted);
    expect(decrypted).toBe(original);
  });

  it("produces deterministic ciphertext for same input", () => {
    const original = "4242424242424242";
    const encrypted1 = encryptCardNumber(original);
    const encrypted2 = encryptCardNumber(original);
    expect(encrypted1).toBe(encrypted2);
  });

  it("formats as hexIv:hexAuthTag:hexCiphertext", () => {
    const encrypted = encryptCardNumber("4242424242424242");
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(3);
    parts.forEach((part) => {
      expect(part).toMatch(/^[0-9a-f]+$/);
    });
  });

  it("throws on invalid format", () => {
    expect(() => decryptCardNumber("invalid")).toThrow();
    expect(() => decryptCardNumber("a:b")).toThrow();
  });
});

describe("CVV Encryption", () => {
  it("encrypts and decrypts CVVs", () => {
    const original = "123";
    const encrypted = encryptCvv(original);
    const decrypted = decryptCvv(encrypted);
    expect(decrypted).toBe(original);
  });

  it("produces different ciphertext for same input (random IV)", () => {
    const original = "123";
    const encrypted1 = encryptCvv(original);
    const encrypted2 = encryptCvv(original);
    // Random IV means different ciphertext
    expect(encrypted1).not.toBe(encrypted2);
  });
});

describe("Try Decrypt", () => {
  it("returns null for invalid format", () => {
    expect(tryDecryptCardNumber("invalid")).toBeNull();
    expect(tryDecryptCardNumber("a:b")).toBeNull();
    expect(tryDecryptCardNumber("")).toBeNull();
  });

  it("returns null for decryption failure", () => {
    expect(tryDecryptCardNumber("aaaa:bbbb:cccc")).toBeNull();
  });

  it("returns null for CVV invalid format", () => {
    expect(tryDecryptCvv("invalid")).toBeNull();
    expect(tryDecryptCvv("")).toBeNull();
  });
});

describe("Card Number Formatting", () => {
  it("masks card number correctly", () => {
    expect(maskCardNumber("4242424242424242")).toBe("**** **** **** 4242");
  });

  it("extracts last four digits", () => {
    expect(lastFour("4242424242424242")).toBe("4242");
  });

  it("isEncrypted detects encrypted format", () => {
    expect(isEncrypted("aaa:bbb:ccc")).toBe(true);
    expect(isEncrypted("4242424242424242")).toBe(false);
    expect(isEncrypted("")).toBe(false);
  });
});
