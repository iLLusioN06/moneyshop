// =============================================
// MoneyShop - Monthly Report Cron Job
// =============================================
// Trigger: Vercel Cron (vercel.json) or external curl
// Schedule: 1st of each month at 07:00
//
// İşlemler:
//   1. Aylık e-posta raporu açık olan kullanıcıları bul
//   2. Her kullanıcı için PDF rapor oluştur
//   3. PDF ekli e-posta gönder
// =============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, logEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";
import { generateReportPdf } from "@/lib/report-pdf";
import type { ReportData, ReportSummary, AccountBalance, CategoryBreakdown, TopTransaction } from "@/lib/report-pdf";

// ─── Cron Auth ───────────────────────────────────────────

function verifyCron(req: Request): boolean {
  const authHeader = req.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[cron-monthly] CRON_SECRET production'da tanımlı değil — istek reddedildi!");
      return false;
    }
    console.warn("[cron-monthly] CRON_SECRET not set — allowing request (dev mode)");
    return true;
  }
  return authHeader === `Bearer ${secret}`;
}

// ─── Period Helpers ──────────────────────────────────────

/** Son ayın ilk günü (UTC) */
function getLastMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0));
}

/** Son ayın son günü (UTC) */
function getLastMonthEnd(): Date {
  const now = new Date();
  // Bu ayın 1. günü → bir önceki ayın sonu
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 23, 59, 59, 999));
}

function getPeriodLabel(): string {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return lastMonth.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
}

function formatDateString(d: Date): string {
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Report Generation ───────────────────────────────────

async function generateUserReport(userId: string, userName: string): Promise<{ pdfBuffer: Buffer; reportData: ReportData } | null> {
  const periodStart = getLastMonthStart();
  const periodEnd = getLastMonthEnd();
  const currency = "TRY";

  // 1) Transactions in period
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: periodStart, lte: periodEnd },
      status: "COMPLETED",
    },
    include: {
      category: true,
      account: true,
    },
    orderBy: { date: "desc" },
  });

  if (transactions.length === 0) {
    return null; // No transactions → skip
  }

  // 2) Summary
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => Number(sum) + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => Number(sum) + Number(t.amount), 0);

  const summary: ReportSummary = {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    currency,
    transactionCount: transactions.length,
  };

  // 3) Account balances
  const accounts = await prisma.financialAccount.findMany({
    where: { userId, isActive: true },
    orderBy: { balance: "desc" },
  });

  const accountBalances: AccountBalance[] = accounts.map((a) => ({
    name: a.name,
    balance: Number(a.balance),
    currency: a.currency,
    type: a.type,
  }));

  // 4) Category breakdown (expenses only)
  const expenseTransactions = transactions.filter((t) => t.type === "EXPENSE");
  const categoryMap = new Map<string, { amount: number; color: string }>();

  for (const tx of expenseTransactions) {
    const catName = tx.category?.name || "Diğer";
    const existing = categoryMap.get(catName) || { amount: 0, color: tx.category?.color || "#94a3b8" };
    existing.amount += Number(tx.amount);
    categoryMap.set(catName, existing);
  }

  const totalExpenseAmount = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      amount: data.amount,
      percentage: totalExpenseAmount > 0 ? (data.amount / totalExpenseAmount) * 100 : 0,
      color: data.color,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 5) Top transactions (by absolute amount, limit 10)
  const topTransactions: TopTransaction[] = transactions
    .sort((a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount)))
    .slice(0, 10)
    .map((t) => ({
      date: t.date,
      type: t.type,
      description: t.description,
      amount: Number(t.amount),
      currency: t.currency,
      categoryName: t.category?.name || null,
    }));

  const reportData: ReportData = {
    period: getPeriodLabel(),
    startDate: formatDateString(periodStart),
    endDate: formatDateString(periodEnd),
    userName,
    summary,
    accounts: accountBalances,
    categoryBreakdown,
    topTransactions,
  };

  const pdfBuffer = generateReportPdf(reportData);
  return { pdfBuffer, reportData };
}

// ─── Send Report Email ───────────────────────────────────

function buildReportEmailText(userName: string, period: string, summary: ReportSummary): string {
  const sign = summary.netBalance >= 0 ? "+" : "";
  return [
    `Merhaba ${userName},`,
    ``,
    `${period} dönemi finansal raporunuz ekte yer almaktadır.`,
    ``,
    `  Toplam Gelir: +${summary.totalIncome.toFixed(2)} ${summary.currency}`,
    `  Toplam Gider: -${summary.totalExpense.toFixed(2)} ${summary.currency}`,
    `  Net Durum: ${sign}${summary.netBalance.toFixed(2)} ${summary.currency}`,
    `  İşlem Sayısı: ${summary.transactionCount}`,
    ``,
    `Detaylı rapor için MoneyShop uygulamasını ziyaret edin.`,
    ``,
    `İyi günler dileriz,\nMoneyShop`,
  ].join("\n");
}

// ─── POST /api/cron/monthly-report ───────────────────────

export async function POST(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const results: Array<{ userId: string; email: string; status: string; error?: string }> = [];

  try {
    // Aylık rapor açık olan kullanıcıları bul
    const emailSettings = await prisma.emailNotificationSetting.findMany({
      where: {
        enabled: true,
        onMonthlyReport: true,
        email: { not: "" },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    console.log(`[cron-monthly] Found ${emailSettings.length} users with monthly report enabled`);

    for (const setting of emailSettings) {
      const userId = setting.user.id;
      const userName = setting.user.name || "Kullanıcı";
      const email = setting.email;

      try {
        // Kullanıcı aktif mi?
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { isActive: true },
        });
        if (!user?.isActive) {
          results.push({ userId, email, status: "SKIPPED_INACTIVE" });
          continue;
        }

        // PDF rapor oluştur
        const report = await generateUserReport(userId, userName);
        if (!report) {
          results.push({ userId, email, status: "SKIPPED_NO_DATA" });
          continue;
        }

        const { pdfBuffer, reportData } = report;

        // PDF'i base64'e çevir
        const pdfBase64 = pdfBuffer.toString("base64");

        // E-postayı gönder
        const emailText = buildReportEmailText(userName, reportData.period, reportData.summary);
        const result = await sendEmail({
          to: email,
          subject: `[MoneyShop] Aylık Finansal Rapor - ${reportData.period}`,
          text: emailText,
          attachments: [
            {
              filename: `moneyshop-rapor-${reportData.period.replace(/\s+/g, "-")}.pdf`,
              content: pdfBase64,
            },
          ],
        });

        // Log
        await logEmail({
          userId,
          to: email,
          subject: `[MoneyShop] Aylık Finansal Rapor - ${reportData.period}`,
          body: emailText,
          event: "MONTHLY_REPORT",
          status: result?.success ? "SENT" : "FAILED",
          error: result?.success ? undefined : (result?.error ?? "Gönderilemedi"),
        });

        // Denetim günlüğü
        await createAuditLog({
          userId,
          action: "CREATE",
          entity: "MONTHLY_REPORT",
          details: {
            period: reportData.period,
            transactionCount: reportData.summary.transactionCount,
            netBalance: reportData.summary.netBalance,
          },
          ip: null,
          userAgent: "cron-monthly",
        });

        results.push({
          userId,
          email,
          status: result?.success ? "SENT" : "FAILED",
          error: result?.success ? undefined : (result?.error ?? "Gönderilemedi"),
        });
      } catch (error) {
        console.error(`[cron-monthly] Failed for user ${userId}:`, error);
        results.push({
          userId,
          email,
          status: "ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  } catch (error) {
    console.error("[cron-monthly] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === "production"
          ? "Internal error"
          : error instanceof Error ? error.message : "Unknown error",
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    summary: {
      total: results.length,
      sent: results.filter((r) => r.status === "SENT").length,
      skipped: results.filter((r) => r.status.startsWith("SKIPPED")).length,
      failed: results.filter((r) => r.status === "FAILED" || r.status === "ERROR").length,
    },
    results,
    durationMs: Date.now() - startTime,
  });
}
