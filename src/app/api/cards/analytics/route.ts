// =============================================
// MoneyShop - Card Spending Analytics API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCacheHeaders } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────

export interface CategorySpending {
  categoryId: string | null;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlySpending {
  month: string;       // "2025-01"
  monthLabel: string;  // "Ocak"
  year: number;
  income: number;
  expense: number;
  count: number;
}

export interface CardAnalytics {
  summary: {
    totalSpent: number;
    totalIncome: number;
    totalTransactions: number;
    avgTransaction: number;
    biggestExpense: { amount: number; description: string | null; date: Date } | null;
    currency: string;
  };
  categoryBreakdown: CategorySpending[];
  monthlyTrend: MonthlySpending[];
  dailySpending: Array<{ date: string; amount: number; count: number }>;
}

// ─── Helpers ─────────────────────────────────────────────

const MONTH_LABELS: Record<string, string> = {
  "01": "Ocak", "02": "Şubat", "03": "Mart", "04": "Nisan",
  "05": "Mayıs", "06": "Haziran", "07": "Temmuz", "08": "Ağustos",
  "09": "Eylül", "10": "Ekim", "11": "Kasım", "12": "Aralık",
};

function getMonthLabel(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return MONTH_LABELS[m] || m;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ─── GET /api/cards/analytics ────────────────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    // 1) Kullanıcının kartını bul
    const card = await prisma.card.findFirst({
      where: { userId: session.user.id },
    });

    if (!card) {
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalSpent: 0,
            totalIncome: 0,
            totalTransactions: 0,
            avgTransaction: 0,
            biggestExpense: null,
            currency: "IQD",
          },
          categoryBreakdown: [],
          monthlyTrend: [],
          dailySpending: [],
        } satisfies CardAnalytics,
      });
    }

    // 2) Kart ile ilişkili tüm işlemleri çek (kategori dahil)
    // Son 12 ay için veri çek (sınırsız data çekmeyi önle)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const transactions = await prisma.transaction.findMany({
      where: {
        cardId: card.id,
        date: { gte: twelveMonthsAgo },
      },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 1000,
    });

    const currency = card.currency || "IQD";

    if (transactions.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalSpent: 0,
            totalIncome: 0,
            totalTransactions: 0,
            avgTransaction: 0,
            biggestExpense: null,
            currency,
          },
          categoryBreakdown: [],
          monthlyTrend: [],
          dailySpending: [],
        } satisfies CardAnalytics,
      });
    }

    // ── Summary ──
    const expenses = transactions.filter((t) => t.type === "EXPENSE");
    const incomes = transactions.filter((t) => t.type === "INCOME");

    const totalSpent = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
    const totalTransactions = transactions.length;
    const avgTransaction = totalTransactions > 0
      ? expenses.reduce((s, t) => s + Number(t.amount), 0) / (expenses.length || 1)
      : 0;

    const biggestExpense = expenses.length > 0
      ? expenses.reduce((max, t) => (Number(t.amount) > Number(max.amount) ? t : max), expenses[0])
      : null;

    // ── Category Breakdown (sadece giderler) ──
    const categoryMap = new Map<string, { name: string; color: string; icon: string; amount: number; count: number }>();

    for (const tx of expenses) {
      const catId = tx.categoryId || "__uncategorized__";
      const existing = categoryMap.get(catId) || {
        name: tx.category?.name || "Kategorisiz",
        color: tx.category?.color || "#94a3b8",
        icon: tx.category?.icon || "circle",
        amount: 0,
        count: 0,
      };
      existing.amount += Number(tx.amount);
      existing.count++;
      categoryMap.set(catId, existing);
    }

    const totalExpenseAmount = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const categoryBreakdown: CategorySpending[] = Array.from(categoryMap.entries())
      .map(([catId, data]) => ({
        categoryId: catId === "__uncategorized__" ? null : catId,
        categoryName: data.name,
        categoryColor: data.color,
        categoryIcon: data.icon,
        amount: data.amount,
        percentage: totalExpenseAmount > 0 ? parseFloat(((data.amount / totalExpenseAmount) * 100).toFixed(1)) : 0,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    // ── Monthly Trend (son 12 ay) ──
    const monthlyMap = new Map<string, { income: number; expense: number; count: number }>();

    // Son 12 ay için boş kayıtları da ekle
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getMonthKey(d);
      monthlyMap.set(key, { income: 0, expense: 0, count: 0 });
    }

    for (const tx of transactions) {
      const key = getMonthKey(tx.date);
      if (monthlyMap.has(key)) {
        const entry = monthlyMap.get(key)!;
        if (tx.type === "INCOME") entry.income += Number(tx.amount);
        else if (tx.type === "EXPENSE") entry.expense += Number(tx.amount);
        entry.count++;
      }
    }

    const monthlyTrend: MonthlySpending[] = Array.from(monthlyMap.entries())
      .map(([key, data]) => {
        const [yearStr, monthStr] = key.split("-");
        const monthIndex = parseInt(monthStr, 10) - 1;
        const d = new Date(parseInt(yearStr), monthIndex, 1);
        return {
          month: key,
          monthLabel: getMonthLabel(d),
          year: parseInt(yearStr),
          income: data.income,
          expense: data.expense,
          count: data.count,
        };
      });

    // ── Daily Spending (son 30 gün) ──
    const dailyMap = new Map<string, { amount: number; count: number }>();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const tx of expenses) {
      if (tx.date >= thirtyDaysAgo) {
        const key = formatDateStr(tx.date);
        const existing = dailyMap.get(key) || { amount: 0, count: 0 };
        existing.amount += Number(tx.amount);
        existing.count++;
        dailyMap.set(key, existing);
      }
    }

    // Tüm günleri doldur (boş olanları 0 ile)
    const dailySpending: Array<{ date: string; amount: number; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = formatDateStr(d);
      dailySpending.push({
        date: key,
        amount: dailyMap.get(key)?.amount || 0,
        count: dailyMap.get(key)?.count || 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSpent,
          totalIncome,
          totalTransactions,
          avgTransaction: Math.round(avgTransaction * 100) / 100,
          biggestExpense: biggestExpense
            ? { amount: Number(biggestExpense.amount), description: biggestExpense.description, date: biggestExpense.date }
            : null,
          currency,
        },
        categoryBreakdown,
        monthlyTrend,
        dailySpending,
      } satisfies CardAnalytics,
    }, { headers: getCacheHeaders(60) });
  } catch (error) {
    console.error("[cards-analytics] Error:", error);
    return NextResponse.json(
      { error: "Analitik verileri alınırken hata oluştu." },
      { status: 500 }
    );
  }
}
