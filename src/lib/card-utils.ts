// =============================================
// MoneyShop - Card Utilities
// =============================================
// - AES-256-GCM encryption/decryption for card numbers and CVVs
// - Luhn algorithm validation and secure card number generation
// - cryptographically secure random via Node.js crypto
// =============================================

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomInt,
  scryptSync,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits — GCM standard
const SALT = "moneyshop-card-key-derivation-v1";

// ─── Key Derivation ──────────────────────────────────────

/**
 * Derive the 256-bit AES key from the CARD_ENCRYPTION_KEY env var
 * using scrypt (memory-hard KDF).
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.CARD_ENCRYPTION_KEY;
  if (!secret || secret.length < 16) {
    throw new Error(
      "CARD_ENCRYPTION_KEY ortam değişkeni tanımlanmamış veya çok kısa. " +
      "En az 16 karakterlik bir anahtar belirleyin."
    );
  }
  return scryptSync(secret, SALT, KEY_LENGTH);
}

// ─── Card Number Encryption (Deterministic) ──────────────
// Deterministic IV (derived from plaintext) ensures same plaintext →
// same ciphertext, preserving the @unique constraint on cardNumber.

function deterministicIv(plaintext: string): Buffer {
  return createHash("sha256").update(plaintext).digest().subarray(0, IV_LENGTH);
}

/**
 * Encrypt card number with AES-256-GCM (deterministic IV).
 * @returns `hexIv:hexAuthTag:hexCiphertext`
 */
export function encryptCardNumber(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = deterministicIv(plaintext);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt card number from `hexIv:hexAuthTag:hexCiphertext`.
 */
export function decryptCardNumber(encrypted: string): string {
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Geçersiz şifrelenmiş kart numarası formatı.");
  }
  const [ivHex, authTagHex, dataHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const data = Buffer.from(dataHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(data) + decipher.final("utf8");
}

/**
 * Try to decrypt a card number, returning null on failure
 * (handles legacy plaintext data gracefully).
 */
export function tryDecryptCardNumber(encrypted: string): string | null {
  // If it doesn't look like our encrypted format, it's likely legacy plaintext
  if (!encrypted || encrypted.split(":").length !== 3) {
    return null;
  }
  try {
    return decryptCardNumber(encrypted);
  } catch {
    return null;
  }
}

// ─── CVV Encryption (Random IV) ──────────────────────────
// CVV does not need to be searchable, so random IV provides
// maximum security (different ciphertext each time).

/**
 * Encrypt CVV with AES-256-GCM (random IV).
 * @returns `hexIv:hexAuthTag:hexCiphertext`
 */
export function encryptCvv(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt CVV from `hexIv:hexAuthTag:hexCiphertext`.
 */
export function decryptCvv(encrypted: string): string {
  // Same format as card number, reuse the same logic
  return decryptCardNumber(encrypted);
}

/**
 * Try to decrypt a CVV, returning null on failure.
 */
export function tryDecryptCvv(encrypted: string): string | null {
  if (!encrypted || encrypted.split(":").length !== 3) {
    return null;
  }
  try {
    return decryptCardNumber(encrypted);
  } catch {
    return null;
  }
}

// ─── Luhn Algorithm ──────────────────────────────────────

/**
 * Validate a card number using the Luhn algorithm (ISO/IEC 7812).
 * Returns true if the number passes the checksum.
 */
export function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    const digit = parseInt(cardNumber[i], 10);
    if (isNaN(digit)) return false;
    if (alternate) {
      const doubled = digit * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    } else {
      sum += digit;
    }
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

// ─── Secure Card Number Generation ───────────────────────
// Uses crypto.randomInt() instead of Math.random()
// Generated numbers pass Luhn check.

const CARD_PREFIX = "5200";
const CARD_NUMBER_LENGTH = 16;

/** Cryptographically secure random digit (0-9). */
function cryptoRandomDigit(): number {
  return randomInt(0, 10);
}

/**
 * Generate a valid 16-digit card number:
 * - Prefix "5200" (IIN/BIN)
 * - 11 random digits (positions 5–15)
 * - Luhn check digit (position 16)
 * - Cryptographically secure RNG
 */
export function generateCardNumber(): string {
  // Build first 15 digits: prefix + random
  let partial = CARD_PREFIX;
  for (let i = CARD_PREFIX.length; i < CARD_NUMBER_LENGTH - 1; i++) {
    partial += cryptoRandomDigit().toString();
  }

  // Calculate Luhn check digit
  let sum = 0;
  let alternate = true; // rightmost digit of partial (pos 15) gets doubled
  for (let i = partial.length - 1; i >= 0; i--) {
    let digit = parseInt(partial[i], 10);
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  const full = partial + checkDigit.toString();

  // Verify — should never fail, but catch bugs early
  if (!luhnCheck(full)) {
    throw new Error("Üretilen kart numarası Luhn kontrolünden geçemedi.");
  }

  return full;
}

/**
 * Generate a 3-digit CVV using cryptographically secure RNG.
 */
export function generateCvv(): string {
  return String(randomInt(100, 1000)); // 100–999
}

// ─── Formatting ──────────────────────────────────────────

/**
 * Mask card number: show only last 4 digits.
 */
export function maskCardNumber(cardNumber: string): string {
  const last4 = cardNumber.slice(-4);
  return `**** **** **** ${last4}`;
}

/**
 * Extract last 4 digits for display/reference.
 */
export function lastFour(cardNumber: string): string {
  return cardNumber.slice(-4);
}

/**
 * Check whether a string looks like it is already in our encrypted format.
 */
export function isEncrypted(value: string): boolean {
  return typeof value === "string" && value.split(":").length === 3;
}
