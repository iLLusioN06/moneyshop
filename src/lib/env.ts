// =============================================
// MoneyShop - Environment Variable Validation
// =============================================
// Uygulama başlarken zorunlu env değişkenlerini doğrular.
// Eksik/yanlış değişkenler erken hata verir.

const REQUIRED_SERVER = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "CARD_ENCRYPTION_KEY",
  "AUTH_SECRET",
] as const;

const CRITICAL_SERVER = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "RESEND_API_KEY",
  "CRON_SECRET",
  "VAPID_PRIVATE_KEY",
  "REDIS_URL",
] as const;

const REQUIRED_CLIENT = [
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
] as const;

function validateEnv() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Server-side checks
  if (typeof window === "undefined") {
    // Zorunlu değişkenler
    for (const key of REQUIRED_SERVER) {
      if (!process.env[key]) {
        errors.push(`Zorunlu sunucu değişkeni eksik: ${key}`);
      }
    }

    // Kritik değişkenler (eksikse uyarı)
    for (const key of CRITICAL_SERVER) {
      if (!process.env[key]) {
        warnings.push(`Kritik sunucu değişkeni eksik: ${key}`);
      }
    }

    // CARD_ENCRYPTION_KEY uzunluk kontrolü
    const cardKey = process.env.CARD_ENCRYPTION_KEY;
    if (cardKey && cardKey.length < 32) {
      errors.push("CARD_ENCRYPTION_KEY en az 32 karakter olmalıdır");
    }

    // NEXTAUTH_SECRET uzunluk kontrolü
    const authSecret = process.env.NEXTAUTH_SECRET;
    if (authSecret && authSecret.length < 16) {
      errors.push("NEXTAUTH_SECRET en az 16 karakter olmalıdır");
    }

    // AUTH_SECRET uzunluk kontrolü
    const authSecretAlt = process.env.AUTH_SECRET;
    if (authSecretAlt && authSecretAlt.length < 16) {
      errors.push("AUTH_SECRET en az 16 karakter olmalıdır");
    }
  }

  // Client-side checks
  for (const key of REQUIRED_CLIENT) {
    if (!process.env[key]) {
      errors.push(`Zorunlu istemci değişkeni eksik: ${key}`);
    }
  }

  // Uyarıları göster
  if (warnings.length > 0) {
    console.warn("\n========================================");
    console.warn("  MoneyShop - Env Uyarıları");
    console.warn("========================================\n");
    warnings.forEach((w) => console.warn(`  ⚠️  ${w}`));
    console.warn("");
  }

  // Hataları göster
  if (errors.length > 0) {
    console.error("\n========================================");
    console.error("  MoneyShop - Env Doğrulama Hatası");
    console.error("========================================\n");
    errors.forEach((err) => console.error(`  ❌ ${err}`));
    console.error("\n  .env.example dosyasını .env.local olarak kopyalayıp düzenleyin.\n");

    if (process.env.NODE_ENV === "production") {
      throw new Error(`Env doğrulaması başarısız: ${errors.join(", ")}`);
    } else {
      console.warn("  ⚠️  Development modunda devam ediliyor...\n");
    }
  }
}

validateEnv();

export { validateEnv };
