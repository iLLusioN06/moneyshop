// =============================================
// MoneyShop - Financial Health Score API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders } from "@/lib/utils";

interface HealthScore {
  overall: number;
  breakdown: {
    savingsRate: { score: number; value: number; label: string };
    budgetAdherence: { score: number; value: number; label: string };
    emergencyFund: { score: number; value: number; label: string };
    transactionConsistency: { score: number; value: number; label: string };
    accountDiversity: { score: number; value: number; label: string };
  };
  tips: string[];
}

async function handler(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const [
      monthlyIncome,
      monthlyExpense,
      accounts,
      budgets,
      recentTransactions,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: { gte: monthStart },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),

      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: monthStart },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),

      prisma.financialAccount.findMany({
        where: { userId, isActive: true },
      }),

      prisma.budget.findMany({
        where: { userId },
        include: { category: true },
      }),

      prisma.transaction.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { date: "desc" },
        take: 100,
      }),

      prisma.transaction.groupBy({
        by: ["date"],
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: sixMonthsAgo },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(monthlyIncome._sum.amount) || 0;
    const totalExpense = Number(monthlyExpense._sum.amount) || 0;
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // 1. Tasarruf Oranı (Savings Rate) - %40 ağırlık
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const savingsScore = Math.min(100, Math.max(0, savingsRate * 2.5));

    // 2. Bütçe Uyumunu (Budget Adherence) - %25 ağırlık
    let budgetAdherenceScore = 100;
    if (budgets.length > 0) {
      const overBudgetCount = budgets.filter(b => Number(b.spent) > Number(b.amount)).length;
      budgetAdherenceScore = Math.max(0, 100 - (overBudgetCount / budgets.length) * 100);
    }

    // 3. Acil Durum Fonu (Emergency Fund) - %20 ağırlık
    const totalMonthlyExpense = totalExpense || 1;
    const emergencyFundMonths = totalBalance / totalMonthlyExpense;
    const emergencyScore = Math.min(100, emergencyFundMonths * 20);

    // 4. İşlem Tutarlılığı (Transaction Consistency) - %10 ağırlık
    const transactionDates = new Set(
      recentTransactions.map(t => new Date(t.date).toDateString())
    );
    const uniqueDays = transactionDates.size;
    const consistencyScore = Math.min(100, (uniqueDays / 30) * 100);

    // 5. Hesap Çeşitliliği (Account Diversity) - %5 ağırlık
    const accountTypes = new Set(accounts.map(a => a.type));
    const diversityScore = Math.min(100, accountTypes.size * 25);

    // Ağırlıklı toplam
    const overall = Math.round(
      savingsScore * 0.4 +
      budgetAdherenceScore * 0.25 +
      emergencyScore * 0.2 +
      consistencyScore * 0.1 +
      diversityScore * 0.05
    );

    // İpuçları
    const tips: string[] = [];
    if (savingsRate < 20) tips.push("Giderlerinizi azaltarak tasarruf oranınızı artırın.");
    if (budgetAdherenceScore < 80) tips.push("Bütçe limitlerinizi aşmamaya çalışın.");
    if (emergencyFundMonths < 3) tips.push("Acil durum fonunuzu en az 3 aylık gider seviyesine çıkarın.");
    if (uniqueDays < 15) tips.push("Düzenli işlemler yaparak finansal alışkanlıklarınızı güçlendirin.");

    const healthScore: HealthScore = {
      overall,
      breakdown: {
        savingsRate: {
          score: Math.round(savingsRate),
          value: savingsRate,
          label: savingsRate >= 20 ? "İyi" : savingsRate >= 10 ? "Orta" : "Düşük",
        },
        budgetAdherence: {
          score: Math.round(budgetAdherenceScore),
          value: budgetAdherenceScore,
          label: budgetAdherenceScore >= 80 ? "İyi" : budgetAdherenceScore >= 50 ? "Orta" : "Düşük",
        },
        emergencyFund: {
          score: Math.round(emergencyScore),
          value: emergencyFundMonths,
          label: emergencyFundMonths >= 6 ? "Güçlü" : emergencyFundMonths >= 3 ? "Yeterli" : "Yetersiz",
        },
        transactionConsistency: {
          score: Math.round(consistencyScore),
          value: uniqueDays,
          label: consistencyScore >= 60 ? "Aktif" : consistencyScore >= 30 ? "Orta" : "Pasif",
        },
        accountDiversity: {
          score: Math.round(diversityScore),
          value: accountTypes.size,
          label: diversityScore >= 75 ? "Çeşitli" : diversityScore >= 50 ? "Orta" : "Dar",
        },
      },
      tips,
    };

    return NextResponse.json(
      { success: true, data: healthScore },
      { headers: getCacheHeaders(60) }
    );
  } catch (error) {
    console.error("Financial Health GET error:", error);
    return NextResponse.json(
      { error: "Finansal sağlık verileri alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, handler);
