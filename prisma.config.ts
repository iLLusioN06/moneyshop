// =============================================
// MoneyShop - Prisma Konfigürasyonu (v7+)
// =============================================
// Prisma 7'de datasource URL'i bu dosyada tanımlanır,
// schema.prisma dosyasında değil.

import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";

// .env.local dosyasını yükle (Next.js ile uyumlu)
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
