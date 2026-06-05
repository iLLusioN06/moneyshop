// =============================================
// MoneyShop - Admin Kullanıcı Seed
// =============================================
// Kullanıcı adı: admin  (email: admin@moneyshop.iq)
// Şifre: admin123
// Rol: ADMIN
// =============================================

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg(connectionString);
  const prisma = new PrismaClient({ adapter });

  const password = await hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@moneyshop.iq" },
    update: {
      password,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "admin",
      email: "admin@moneyshop.iq",
      password,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin kullanıcı oluşturuldu:");
  console.log(`   Kullanıcı adı: admin`);
  console.log(`   E-posta: admin@moneyshop.iq`);
  console.log(`   Şifre: admin123`);
  console.log(`   Rol: ${admin.role}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Seed hatası:", e);
  process.exit(1);
});
