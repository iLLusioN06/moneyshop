// =============================================
// MoneyShop - Daily Cron Job
// =============================================
// Trigger: Vercel Cron (vercel.json) or external curl
// Schedule: Every day at 06:00 (configurable in vercel.json)
//
// İşlemler:
//   1. Vadesi gelmiş tekrarlanan işlemleri oluştur
//   2. Bütçe limitlerini kontrol et ve uyarı gönder
// =============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";

// ─── Cron Auth ───────────────────────────────────────────

function verifyCron(req: Request): boolean {
  const authHeader = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.warn("[cron] CRON_SECRET not set — allowing request (dev mode)");
    return true; // Dev mode: allow without secret
  }
  return authHeader === `Bearer ${secret}`;
}

// ─── Period Helpers ──────────────────────────────────────

function getPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case "WEEKLY":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    case "YEARLY":
      return new Date(now.getFullYear(), 0, 1);
    case "MONTHLY":
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function calculateNextDate(
  frequency: string,
  intervalCount: number,
  from: Date
): Date {
  const next = new Date(from);
  switch (frequency) {
    case "DAILY":
      next.setDate(next.getDate() + intervalCount);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7 * intervalCount);
      break;
    case "BIWEEKLY":
      next.setDate(next.getDate() + 14 * intervalCount);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + intervalCount);
      break;
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3 * intervalCount);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + intervalCount);
      break;
  }
  return next;
}

// ─── 1) Process Recurring Transactions ───────────────────

interface ProcessRecurringResult {
  processed: number;
  errors: number;
  completed: number;
}

async function processRecurringTransactions(): Promise<ProcessRecurringResult> {
  const result = { processed: 0, errors: 0, completed: 0 };
  const now = new Date();

  // Vadesi gelmiş (veya geçmiş) tüm aktif tekrarlanan işlemleri bul
  const dueTransactions = await prisma.recurringTransaction.findMany({
    where: {
      status: "ACTIVE",
      nextDate: { lte: now },
    },
    include: {
      account: true,
      category: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { nextDate: "asc" },
    take: 200, // Tek seferde en fazla 200 işlem
  });

  for (const recurring of dueTransactions) {
    try {
      // Transaction oluştur
      await prisma.transaction.create({
        data: {
          userId: recurring.userId,
          accountId: recurring.accountId,
          categoryId: recurring.categoryId,
          type: recurring.type,
          amount: recurring.amount,
          currency: recurring.currency,
          description: recurring.description || `[Tekrarlanan] ${recurring.description || ""}`,
          status: "COMPLETED",
          date: now,
          // Transfer bilgilerini de taşı
          recipientName: recurring.transferRecipientName,
          recipientIban: recurring.transferRecipientIban,
          recipientBank: recurring.transferRecipientBank,
          recipientUserId: recurring.recipientUserId,
        },
      });

      // occurrenceCount + 1
      const newOccurrenceCount = recurring.occurrenceCount + 1;

      // nextDate'i güncelle
      const newNextDate = calculateNextDate(
        recurring.frequency,
        recurring.intervalCount,
        new Date(recurring.nextDate)
      );

      // Bitirme kontrolü
      const isExpired = recurring.endDate && newNextDate > recurring.endDate;
      const maxReached =
        recurring.totalOccurrences !== null &&
        newOccurrenceCount >= recurring.totalOccurrences;

      const newStatus = isExpired || maxReached ? "COMPLETED" : "ACTIVE";

      await prisma.recurringTransaction.update({
        where: { id: recurring.id },
        data: {
          occurrenceCount: newOccurrenceCount,
          lastProcessed: now,
          nextDate: newNextDate,
          status: newStatus,
        },
      });

      if (newStatus === "COMPLETED") {
        result.completed++;
      }

      // Denetim günlüğü
      await createAuditLog({
        userId: recurring.userId,
        action: "CREATE",
        entity: "RECURRING_TRANSACTION",
        entityId: recurring.id,
        details: {
          type: "auto_processed",
          amount: recurring.amount,
          frequency: recurring.frequency,
          occurrence: newOccurrenceCount,
        },
        ip: null,
        userAgent: "cron",
      });

      // E-posta bildirimi
      const userName = recurring.user.name || "Kullanıcı";
      sendNotification(recurring.userId, "TRANSACTION", () => ({
        subject: `[MoneyShop] Tekrarlanan İşlem Gerçekleşti`,
        text: [
          `Merhaba ${userName},`,
          ``,
          `Tekrarlanan işleminiz otomatik olarak gerçekleştirildi:`,
          ``,
          `  Tür: ${recurring.type === "INCOME" ? "Gelir" : recurring.type === "EXPENSE" ? "Gider" : "Transfer"}`,
          `  Tutar: ${recurring.type === "INCOME" ? "+" : "-"}${recurring.amount.toFixed(2)} ${recurring.currency}`,
          `  Hesap: ${recurring.account.name}`,
          recurring.description ? `  Açıklama: ${recurring.description}` : "",
          `  Tarih: ${now.toLocaleDateString("tr-TR")}`,
          ``,
          `Bir sonraki işlem: ${newNextDate.toLocaleDateString("tr-TR")}`,
          ``,
          `MoneyShop uygulamasından detayları görüntüleyebilirsiniz.`,
          ``,
          `İyi günler dileriz,\nMoneyShop`,
        ].filter(Boolean).join("\n"),
      })).catch(() => {});

      result.processed++;
    } catch (error) {
      console.error(`[cron] Recurring transaction ${recurring.id} failed:`, error);
      result.errors++;
    }
  }

  return result;
}

// ─── 2) Budget Alerts ────────────────────────────────────

interface BudgetAlertResult {
  total: number;
  warnings: number;
  overLimit: number;
  errors: number;
}

async function checkBudgets(): Promise<BudgetAlertResult> {
  const result = { total: 0, warnings: 0, overLimit: 0, errors: 0 };

  // Tüm kullanıcıların aktif bütçelerini getir
  const budgets = await prisma.budget.findMany({
    where: { endDate: null },
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  result.total = budgets.length;

  for (const budget of budgets) {
    try {
      const periodStart = getPeriodStart(budget.period);

      // Dönem içindeki harcamaları topla
      const spentAgg = await prisma.transaction.aggregate({
        where: {
          userId: budget.userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: periodStart },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      });

      const spent = spentAgg._sum.amount || 0;

      // spent alanını güncelle (opsiyonel, cache)
      await prisma.budget.update({
        where: { id: budget.id },
        data: { spent },
      });

      if (spent === 0 || budget.amount === 0) continue;

      const percentage = (spent / budget.amount) * 100;
      const categoryName = budget.category?.name || "Kategori";

      if (percentage >= 100) {
        // Limit aşımı uyarısı
        await sendNotification(budget.userId, "BUDGET_ALERT", () => ({
          subject: `[MoneyShop] Bütçe Limiti Aşıldı: ${categoryName}`,
          text: [
            `Merhaba ${budget.user.name || "Kullanıcı"},`,
            ``,
            `⚠️ Bütçe limitiniz aşıldı!`,
            ``,
            `  Kategori: ${categoryName}`,
            `  Bütçe: ${budget.amount.toFixed(2)} ${budget.currency}`,
            `  Harcanan: ${spent.toFixed(2)} ${budget.currency}`,
            `  Aşım: ${(spent - budget.amount).toFixed(2)} ${budget.currency}`,
            ``,
            `Harcamalarınızı gözden geçirmek isteyebilirsiniz.`,
            ``,
            `MoneyShop uygulamasından detayları görüntüleyebilirsiniz.`,
            ``,
            `İyi günler dileriz,\nMoneyShop`,
          ].join("\n"),
        })).catch(() => {});
        result.overLimit++;
      } else if (percentage >= 80) {
        // Yaklaşma uyarısı
        await sendNotification(budget.userId, "BUDGET_ALERT", () => ({
          subject: `[MoneyShop] Bütçe Uyarısı: ${categoryName}`,
          text: [
            `Merhaba ${budget.user.name || "Kullanıcı"},`,
            ``,
            `⚠️ Bütçe limitinize yaklaşıyorsunuz!`,
            ``,
            `  Kategori: ${categoryName}`,
            `  Bütçe: ${budget.amount.toFixed(2)} ${budget.currency}`,
            `  Harcanan: ${spent.toFixed(2)} ${budget.currency}`,
            `  Oran: %${percentage.toFixed(0)}`,
            ``,
            `Harcamalarınızı gözden geçirmek isteyebilirsiniz.`,
            ``,
            `MoneyShop uygulamasından detayları görüntüleyebilirsiniz.`,
            ``,
            `İyi günler dileriz,\nMoneyShop`,
          ].join("\n"),
        })).catch(() => {});
        result.warnings++;
      }
    } catch (error) {
      console.error(`[cron] Budget check failed for ${budget.id}:`, error);
      result.errors++;
    }
  }

  return result;
}

// ─── POST /api/cron/daily ────────────────────────────────

export async function POST(req: Request) {
  // 1) Authorization
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const summary: Record<string, unknown> = {};

  try {
    // 2) Recurring transactions
    const recurringResult = await processRecurringTransactions();
    summary.recurring = {
      processed: recurringResult.processed,
      errors: recurringResult.errors,
      completed: recurringResult.completed,
    };

    // 3) Budget alerts
    const budgetResult = await checkBudgets();
    summary.budget = {
      total: budgetResult.total,
      warnings: budgetResult.warnings,
      overLimit: budgetResult.overLimit,
      errors: budgetResult.errors,
    };
  } catch (error) {
    console.error("[cron] Fatal error:", error);
    summary.error = error instanceof Error ? error.message : "Unknown error";
  }

  summary.durationMs = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    summary,
  });
}
