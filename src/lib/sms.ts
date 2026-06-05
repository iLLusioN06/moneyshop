import { createHash } from "crypto";

/**
 * 6 haneli SMS kodu oluşturur.
 * 🔴 ŞİMDİLİK SABİT: 123456 — gerçek SMS entegrasyonunda değiştirilecek.
 */
export function generateSmsCode(): string {
  return "123456";
}

/**
 * SMS kodunu SHA-256 ile hash'ler.
 */
export function hashSmsCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/**
 * SMS gönderme (mock).
 * Gerçek entegrasyon için burayı Twilio / Netgsm / vs. ile değiştirin.
 */
export async function sendSms(phone: string, code: string): Promise<void> {
  // TODO: Gerçek SMS entegrasyonu
  console.log("========================================");
  console.log(`[SMS] Gönderilen: ${phone}`);
  console.log(`[SMS] Kod: ${code}`);
  console.log("========================================");
}
