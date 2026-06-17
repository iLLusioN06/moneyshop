// =============================================
// MoneyShop - SMS Bildirim Servisi
// =============================================
// Twilio üzerinden SMS gönderimi.
// - 2FA doğrulama kodları
// - İşlem bildirimleri
// - Uyarı mesajları
// =============================================

import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

// ─── Twilio Client ──────────────────────────────

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const APP_NAME = "MoneyShop";

let twilioClient: import("twilio").Twilio | null = null;

async function getTwilioClient(): Promise<import("twilio").Twilio | null> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  if (!twilioClient) {
    const twilioModule = await import("twilio");
    twilioClient = twilioModule.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

// ─── SMS Code Generation ────────────────────────

/**
 * 6 haneli rastgele SMS kodu oluşturur.
 */
export function generateSmsCode(): string {
  return String(randomInt(100000, 1000000));
}

/**
 * SMS kodunu SHA-256 ile hash'ler (güvenli karşılaştırma için).
 */
export function hashSmsCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

// ─── Send Result ────────────────────────────────

export interface SendSmsResult {
  success: boolean;
  sid?: string;
  error?: string;
}

// ─── Send SMS ───────────────────────────────────

/**
 * Twilio üzerinden SMS gönderir.
 * - Twilio yapılandırılmamışsa konsola log basar (dev mode)
 * - Hata durumunda { success: false, error } döner
 */
export async function sendSms(phone: string, message: string): Promise<SendSmsResult> {
  const client = await getTwilioClient();

  // Dev mode: Twilio yoksa konsola log
  if (!client || !TWILIO_PHONE_NUMBER) {
    console.log("========================================");
    console.log("[SMS] (mock) Gönderilen:", phone);
    console.log("[SMS] (mock) Mesaj:", message);
    console.log("========================================");
    return { success: true, sid: "mock-sid" };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return { success: true, sid: result.sid };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[SMS] Send failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ─── 2FA SMS Template ───────────────────────────

/**
 * 2FA doğrulama kodunu SMS için formatlar.
 * @param code 6 haneli doğrulama kodu
 * @param appName Uygulama adı (opsiyonel)
 */
export function buildVerificationSms(code: string, appName: string = APP_NAME): string {
  return [
    `${appName}`,
    ``,
    `Doğrulama kodunuz: ${code}`,
    ``,
    `Bu kod 5 dakika süreyle geçerlidir.`,
    `Kodu kimseyle paylaşmayın.`,
  ].join("\n");
}

// ─── SMS Event Types (email.ts ile uyumlu) ──────

export type SmsEvent =
  | "VERIFICATION"   // 2FA / kayıt doğrulama
  | "TRANSACTION"    // İşlem bildirimi
  | "TRANSFER"       // Transfer bildirimi
  | "ALERT"          // Güvenlik / bütçe uyarısı
  | "TEST";

// ─── Preference Check ───────────────────────────

/**
 * Kullanıcının SMS bildirimlerine açık olup olmadığını kontrol eder.
 * email.ts'deki shouldNotify ile benzer pattern.
 */
export async function shouldNotifyBySms(
  userId: string,
  event: SmsEvent
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });

    if (!user?.phone) return false;

    // TODO: İleride SMS bildirim tercihleri tablosu eklenirse
    // burada kontrol yapılabilir. Şimdilik sadece telefon varlığı.
    return true;
  } catch {
    return false;
  }
}

// ─── Log Sent SMS ───────────────────────────────

/**
 * Gönderilen SMS'i veritabanına kaydeder.
 * email.ts'deki logEmail ile aynı pattern.
 */
export async function logSms(params: {
  userId: string;
  phone: string;
  message: string;
  event: SmsEvent;
  status?: string;
  sid?: string;
  error?: string;
}) {
  try {
    // Prisma şemasında smsLog tablosu yoksa, console log
    await prisma.smsLog.create({
      data: {
        userId: params.userId,
        phone: params.phone,
        message: params.message,
        event: params.event,
        status: params.status || "SENT",
        sid: params.sid,
        error: params.error,
      },
    });
  } catch (err) {
    // Tablo yoksa sessizce console'a log
    console.log("[SMS] Log:", params.event, params.phone, params.status);
  }
}

// ─── High-Level Send & Notify (email.ts pattern) ─

/**
 * Kullanıcıya SMS bildirimi gönderir.
 * - Önce tercih kontrolü yapar
 * - SMS'i gönderir
 * - Log kaydı oluşturur
 *
 * @returns true ise SMS başarıyla gönderildi
 */
export async function sendSmsNotification(
  userId: string,
  event: SmsEvent,
  buildFn: () => string | null
): Promise<boolean> {
  const canSend = await shouldNotifyBySms(userId, event);
  if (!canSend) return false;

  const message = buildFn();
  if (!message) return false;

  // Kullanıcının telefonunu al
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  if (!user?.phone) return false;

  const result = await sendSms(user.phone, message);

  await logSms({
    userId,
    phone: user.phone,
    message,
    event,
    status: result.success ? "SENT" : "FAILED",
    sid: result.sid,
    error: result.error,
  });

  return result.success;
}
