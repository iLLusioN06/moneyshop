// =============================================
// MoneyShop - Kart Şifreleme Migrasyon Scripti
// =============================================
// Bu script, veritabanında plaintext olarak saklanan
// kart numaralarını ve CVV'leri AES-256-GCM ile şifreler.
//
// KULLANIM: npx ts-node scripts/migrate-card-encryption.ts
// GEREKSİNİM: CARD_ENCRYPTION_KEY .env.local'da tanımlı olmalı
//
// NOT: Script idempotent'tir - zaten şifrelenmiş kartları atlar.
// Birden fazla kez çalıştırmak güvenlidir.
// =============================================

import { PrismaClient } from "@prisma/client";
import {
  encryptCardNumber,
  encryptCvv,
  isEncrypted,
} from "../src/lib/card-utils";

const prisma = new PrismaClient();

async function migrate() {
  console.log("🔐 Kart şifreleme migrasyonu başlıyor...\n");

  // CARD_ENCRYPTION_KEY kontrolü
  if (!process.env.CARD_ENCRYPTION_KEY) {
    console.error("❌ HATA: CARD_ENCRYPTION_KEY ortam değişkeni tanımlanmamış!");
    console.error("   .env.local dosyasına ekleyin ve script'i tekrar çalıştırın.");
    process.exit(1);
  }

  const allCards = await prisma.card.findMany();
  console.log(`📊 Toplam kart sayısı: ${allCards.length}\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const card of allCards) {
    try {
      const needsCardMigration = !isEncrypted(card.cardNumber);
      const needsCvvMigration = !isEncrypted(card.cvv);

      if (!needsCardMigration && !needsCvvMigration) {
        console.log(`  ⏭️  Kart #${card.id}: Zaten şifrelenmiş, atlanıyor.`);
        skipped++;
        continue;
      }

      console.log(`  🔄 Kart #${card.id} şifreleniyor...`);

      const updateData: Record<string, string> = {};

      if (needsCardMigration) {
        updateData.cardNumber = encryptCardNumber(card.cardNumber);
      }
      if (needsCvvMigration) {
        updateData.cvv = encryptCvv(card.cvv);
      }

      await prisma.card.update({
        where: { id: card.id },
        data: updateData,
      });

      console.log(`  ✅ Kart #${card.id}: Şifrelendi.`);
      migrated++;
    } catch (err) {
      console.error(`  ❌ Kart #${card.id} şifrelenirken hata:`, err);
      errors++;
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log("📋 MİGRASYON RAPORU");
  console.log("═══════════════════════════════════════");
  console.log(`   Toplam kart:     ${allCards.length}`);
  console.log(`   Şifrelenen:      ${migrated}`);
  console.log(`   Atlanan:         ${skipped}`);
  console.log(`   Hata:            ${errors}`);
  console.log("═══════════════════════════════════════\n");

  if (errors > 0) {
    console.warn("⚠️  Bazı kartlar şifrelenemedi. Yukarıdaki hataları inceleyin.");
    process.exit(1);
  }

  console.log("✅ Migrasyon başarıyla tamamlandı!");
  await prisma.$disconnect();
}

migrate().catch((err) => {
  console.error("❌ Beklenmeyen hata:", err);
  process.exit(1);
});
