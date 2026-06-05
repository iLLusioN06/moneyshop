// =============================================
// MoneyShop - Seed
// =============================================

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL tanımlı değil!");

  const adapter = new PrismaPg(connectionString);
  const prisma = new PrismaClient({ adapter });

  // Admin kullanıcı
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@moneyshop.iq" },
    update: { password: adminPassword, role: "ADMIN", isActive: true },
    create: {
      name: "admin",
      email: "admin@moneyshop.iq",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  // Test kullanıcı
  const testPassword = await hash("123456789", 12);
  const test = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: { password: testPassword, role: "USER", isActive: true },
    create: {
      name: "Test Kullanıcı",
      email: "test@test.com",
      password: testPassword,
      role: "USER",
      isActive: true,
    },
  });

  console.log("✅ Kullanıcılar oluşturuldu:");
  console.log(`   [ADMIN] ${admin.email} / admin123`);
  console.log(`   [USER]  ${test.email} / 123456789`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Seed hatası:", e);
  process.exit(1);
});