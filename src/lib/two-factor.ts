// =============================================
// MoneyShop - İki Faktörlü Kimlik Doğrulama (2FA)
// =============================================
// TOTP (Google Authenticator) + Yedek Kodlar
// =============================================

import { OTP } from "otplib";
import { createHash, randomBytes, randomInt, createCipheriv, createDecipheriv } from "crypto";
import { prisma } from "./prisma";
import { hashSmsCode } from "./sms";

// ─── TOTP Yapılandırması ─────────────────────────────────

const otp = new OTP(); // Varsayılan: TOTP, sha1, 6 digits, 30s step

const APP_NAME = "MoneyShop";

// ─── Encryption (TOTP Secret için) ──────────────────────

/**
 * TOTP secret'i şifreler.
 * AES-256-GCM ile, AUTH_SECRET'ten türetilmiş bir key kullanır.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "[security] AUTH_SECRET veya NEXTAUTH_SECRET tanımlı değil! " +
      "TOTP secret'ları güvenli bir şekilde şifrelenemiyor. " +
      "Lütfen .env dosyasında AUTH_SECRET tanımlayın."
    );
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptSecret(encrypted: string): string | null {
  try {
    const key = getEncryptionKey();
    const parts = encrypted.split(":");
    if (parts.length !== 3) return null;
    const [ivHex, authTagHex, ciphertext] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}

// ─── TOTP (Google Authenticator) ─────────────────────────

/**
 * Yeni bir TOTP secret oluşturur.
 */
export function generateTotpSecret(): string {
  return otp.generateSecret();
}

/**
 * Google Authenticator için otpauth:// URI oluşturur.
 */
export function generateTotpUri(email: string, secret: string): string {
  return otp.generateURI({
    issuer: APP_NAME,
    label: email,
    secret,
  });
}

/**
 * TOTP kodunu doğrular.
 * @param token Kullanıcının girdiği 6 haneli kod
 * @param encryptedSecret Şifrelenmiş TOTP secret
 */
export async function verifyTotpToken(token: string, encryptedSecret: string): Promise<boolean> {
  const secret = decryptSecret(encryptedSecret);
  if (!secret) return false;
  try {
    const result = await otp.verify({ token, secret });
    return result.valid;
  } catch {
    return false;
  }
}

/**
 * Ham secret ile TOTP kodunu doğrular (kurulum aşamasında kullanılır).
 */
export async function verifyTotpTokenRaw(token: string, secret: string): Promise<boolean> {
  try {
    const result = await otp.verify({ token, secret });
    return result.valid;
  } catch {
    return false;
  }
}

// ─── Yedek Kodlar ─────────────────────────────────────────

/**
 * 10 adet yedek kurtarma kodu oluşturur.
 * Her kod 8 karakterli, okunabilir format: XXXX-XXXX
 */
export function generateBackupCodes(): { plain: string[]; hashed: string } {
  const plain: string[] = [];
  const hashed: string[] = [];

  for (let i = 0; i < 10; i++) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += chars[randomInt(chars.length)];
      if (j === 3) code += "-";
    }
    plain.push(code);
    hashed.push(hashBackupCode(code));
  }

  return { plain, hashed: hashed.join(",") };
}

export function hashBackupCode(code: string): string {
  return createHash("sha256").update(code.toUpperCase().replace("-", "")).digest("hex");
}

/**
 * Yedek kodu doğrular. Kullanılan kodu listeden çıkarır.
 * @returns Yeni backupCodes string'i veya null (eşleşme yoksa)
 */
export function verifyBackupCode(code: string, storedHashed: string): string | null {
  const codes = storedHashed.split(",");
  const inputHash = hashBackupCode(code);

  for (let i = 0; i < codes.length; i++) {
    if (codes[i] === inputHash) {
      codes.splice(i, 1);
      return codes.length > 0 ? codes.join(",") : "";
    }
  }
  return null;
}

// ─── Pending 2FA Giriş Token'ı ──────────────────────────

import { redis } from "./redis";

interface PendingAuth {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
  method: "AUTHENTICATOR" | "SMS";
  expiresAt: number;
}

// Redis key prefixes
const PENDING_AUTH_PREFIX = "moneyshop:2fa:auth:";
const PENDING_SMS_PREFIX = "moneyshop:2fa:sms:";
const PENDING_AUTH_TTL = 600; // 10 dakika (saniye)
const PENDING_SMS_TTL = 300; // 5 dakika (saniye)

// In-memory fallback (Redis yoksa)
const pendingAuthStore = new Map<string, PendingAuth>();
const pendingSmsStore = new Map<string, { userId: string; code: string; expiresAt: number }>();

// Cleanup intervals (sadece in-memory için)
let CLEANUP_INTERVAL: ReturnType<typeof setInterval> | null = null;
let SMS_CLEANUP: ReturnType<typeof setInterval> | null = null;

function startCleanupIfNeeded() {
  if (redis) return; // Redis varsa cleanup gerekmez

  if (!CLEANUP_INTERVAL) {
    CLEANUP_INTERVAL = setInterval(() => {
      const now = Date.now();
      for (const [token, data] of pendingAuthStore.entries()) {
        if (now > data.expiresAt) {
          pendingAuthStore.delete(token);
        }
      }
    }, 60_000);
    if (CLEANUP_INTERVAL.unref) CLEANUP_INTERVAL.unref();
  }

  if (!SMS_CLEANUP) {
    SMS_CLEANUP = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of pendingSmsStore.entries()) {
        if (now > data.expiresAt) {
          pendingSmsStore.delete(key);
        }
      }
    }, 60_000);
    if (SMS_CLEANUP.unref) SMS_CLEANUP.unref();
  }
}

export async function createPendingAuthToken(data: Omit<PendingAuth, "expiresAt">): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const entry: PendingAuth = { ...data, expiresAt: Date.now() + PENDING_AUTH_TTL * 1000 };

  if (redis) {
    try {
      await redis.setex(
        `${PENDING_AUTH_PREFIX}${token}`,
        PENDING_AUTH_TTL,
        JSON.stringify(entry)
      );
      return token;
    } catch {
      // Redis hatası → in-memory fallback
    }
  }

  startCleanupIfNeeded();
  pendingAuthStore.set(token, entry);
  return token;
}

export async function getPendingAuth(token: string): Promise<PendingAuth | null> {
  if (redis) {
    try {
      const raw = await redis.get(`${PENDING_AUTH_PREFIX}${token}`);
      if (!raw) return null;
      return JSON.parse(raw) as PendingAuth;
    } catch {
      // Redis hatası → in-memory fallback
    }
  }

  const data = pendingAuthStore.get(token);
  if (!data) return null;
  if (Date.now() > data.expiresAt) {
    pendingAuthStore.delete(token);
    return null;
  }
  return data;
}

export async function consumePendingAuth(token: string): Promise<PendingAuth | null> {
  if (redis) {
    try {
      const raw = await redis.getdel(`${PENDING_AUTH_PREFIX}${token}`);
      if (!raw) return null;
      return JSON.parse(raw) as PendingAuth;
    } catch {
      // Redis hatası → in-memory fallback
    }
  }

  const data = pendingAuthStore.get(token) || null;
  if (data) {
    pendingAuthStore.delete(token);
  }
  return data;
}

export function clearPendingAuthStore(): void {
  pendingAuthStore.clear();
}

export function stopPendingAuthCleanup(): void {
  if (CLEANUP_INTERVAL) {
    clearInterval(CLEANUP_INTERVAL);
    CLEANUP_INTERVAL = null;
  }
}

// ─── SMS 2FA Kodu Geçici Depolama ──────────────────────

export async function storeSmsCode(userId: string, code: string): Promise<void> {
  const hashed = hashSmsCode(code);
  const entry = { userId, code: hashed, expiresAt: Date.now() + PENDING_SMS_TTL * 1000 };

  if (redis) {
    try {
      await redis.setex(
        `${PENDING_SMS_PREFIX}${userId}`,
        PENDING_SMS_TTL,
        JSON.stringify(entry)
      );
      return;
    } catch {
      // Redis hatası → in-memory fallback
    }
  }

  startCleanupIfNeeded();
  pendingSmsStore.set(userId, entry);
}

export async function verifySmsCode(userId: string, code: string): Promise<boolean> {
  if (redis) {
    try {
      const raw = await redis.getdel(`${PENDING_SMS_PREFIX}${userId}`);
      if (!raw) return false;
      const stored = JSON.parse(raw) as { code: string };
      return hashSmsCode(code) === stored.code;
    } catch {
      // Redis hatası → in-memory fallback
    }
  }

  const stored = pendingSmsStore.get(userId);
  if (!stored) return false;
  if (Date.now() > stored.expiresAt) {
    pendingSmsStore.delete(userId);
    return false;
  }
  if (hashSmsCode(code) !== stored.code) return false;
  pendingSmsStore.delete(userId);
  return true;
}

export function clearSmsCode(userId: string): void {
  pendingSmsStore.delete(userId);
  if (redis) {
    redis.del(`${PENDING_SMS_PREFIX}${userId}`).catch(() => {});
  }
}

export function stopSmsCleanup(): void {
  if (SMS_CLEANUP) {
    clearInterval(SMS_CLEANUP);
    SMS_CLEANUP = null;
  }
}

// ─── Kullanıcı 2FA Durumu ───────────────────────────────

export async function getUserTwoFactorStatus(userId: string): Promise<{
  enabled: boolean;
  method: string | null;
  isSetupComplete: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorEnabled: true,
      twoFactorMethod: true,
      twoFactorSecret: true,
    },
  });

  if (!user) {
    return { enabled: false, method: null, isSetupComplete: false };
  }

  return {
    enabled: user.twoFactorEnabled,
    method: user.twoFactorMethod,
    isSetupComplete: user.twoFactorEnabled && !!user.twoFactorMethod,
  };
}
