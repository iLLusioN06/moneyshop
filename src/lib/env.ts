// =============================================
// MoneyShop - Environment Variable Validation
// =============================================
// Uygulama başlarken zorunlu env değişkenlerini doğrular.
// Eksik/yanlış değişkenler erken hata verir.

const REQUIRED_SERVER = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "CARD_ENCRYPTION_KEY",
] as const;

// Optional server env vars (for documentation purposes)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OPTIONAL_SERVER = [
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
  "REDIS_URL",
  "CRON_SECRET",
  "FINNHUB_API_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_WS_URL",
] as const;

const REQUIRED_CLIENT = [
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
] as const;

function validateEnv() {
  const errors: string[] = [];

  // Server-side checks (sadece server tarafında çalışır)
  if (typeof window === "undefined") {
    for (const key of REQUIRED_SERVER) {
      if (!process.env[key]) {
        errors.push(`Zorunlu sunucu değişkeni eksik: ${key}`);
      }
    }

    // CARD_ENCRYPTION_KEY uzunluk kontrolü
    const cardKey = process.env.CARD_ENCRYPTION_KEY;
    if (cardKey && cardKey.length < 32) {
      errors.push("CARD_ENCRYPTION_KEY en az 32 karakter olmalıdır");
    }
  }

  // Client-side checks
  for (const key of REQUIRED_CLIENT) {
    if (!process.env[key]) {
      errors.push(`Zorunlu istemci değişkeni eksik: ${key}`);
    }
  }

  if (errors.length > 0) {
    console.error("\n========================================");
    console.error("  MoneyShop - Env Doğrulama Hatası");
    console.error("========================================\n");
    errors.forEach((err) => console.error(`  ❌ ${err}`));
    console.error("\n  .env.example dosyasını .env.local olarak kopyalayıp düzenleyin.\n");

    // Production'da hata fırlat, development'ta sadece uyar
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Env doğrulaması başarısız: ${errors.join(", ")}`);
    } else {
      console.warn("  ⚠️  Development modunda devam ediliyor...\n");
    }
  }
}

// Modül yüklendiğinde çalıştır
validateEnv();

export { validateEnv };
