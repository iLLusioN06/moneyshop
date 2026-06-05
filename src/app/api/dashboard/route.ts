// =============================================
// MoneyShop - Dashboard API (Özet İstatistikler)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Tüm sorguları paralel çalıştır
    const [
      accounts,
      monthlyIncome,
      monthlyExpense,
      prevMonthIncome,
      prevMonthExpense,
      recentTransactions,
      monthlyData,
      categoryBreakdown,
    ] = await Promise.all([
      // Toplam bakiye
      prisma.financialAccount.findMany({
        where: { userId, isActive: true },
      }),

      // Bu ayki gelir
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: { gte: monthStart },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),

      // Bu ayki gider
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: monthStart },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),

      // Geçen ayki gelir
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: { gte: prevMonthStart, lt: monthStart },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),

      // Geçen ayki gider
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: prevMonthStart, lt: monthStart },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),

      // Son 10 işlem
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true, account: true },
        orderBy: { date: "desc" },
        take: 10,
      }),

      // Son 6 aylık veri
      getMonthlyData(userId, 6),

      // Kategori bazında harcama dağılımı (bu ay)
      getCategoryBreakdown(userId, monthStart),
    ]);

    // Hesaplamalar
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalIncome = monthlyIncome._sum.amount || 0;
    const totalExpense = monthlyExpense._sum.amount || 0;
    const prevIncome = prevMonthIncome._sum.amount || 0;
    const prevExpense = prevMonthExpense._sum.amount || 0;

    // Değişim yüzdeleri
    const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;
    const netWorth = totalBalance - totalExpense;

    return NextResponse.json({
      success: true,
      data: {
        totalBalance,
        totalIncome,
        totalExpense,
        netWorth,
        currency: "TRY",
        incomeChange: Math.round(incomeChange * 10) / 10,
        expenseChange: Math.round(expenseChange * 10) / 10,
        balanceChange: Math.round((incomeChange - expenseChange) * 10) / 10,
        recentTransactions,
        monthlyData,
        categoryBreakdown,
      },
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json(
      { error: "Dashboard verileri alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// Aylık gelir/gider verilerini getir
async function getMonthlyData(userId: string, months: number) {
  const data = [];
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date();
    start.setMonth(start.getMonth() - i);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const monthNames = [
      "Oca", "Şub", "Mar", "Nis", "May", "Haz",
      "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
    ];

    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: { gte: start, lt: end },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: start, lt: end },
          status: "COMPLETED",
        },
        _sum: { amount: true },
      }),
    ]);

    data.push({
      month: monthNames[start.getMonth()],
      income: income._sum.amount || 0,
      expense: expense._sum.amount || 0,
    });
  }
  return data;
}

// Kategori bazında harcama dağılımı
async function getCategoryBreakdown(userId: string, monthStart: Date) {
  const transactions = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: monthStart },
      status: "COMPLETED",
      categoryId: { not: null },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  const totalExpense = transactions.reduce(
    (sum, t) => sum + (t._sum.amount || 0),
    0
  );

  if (totalExpense === 0) return [];

  // Kategori detaylarını getir
  const categoryIds = transactions
    .map((t) => t.categoryId)
    .filter(Boolean) as string[];

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return transactions.map((t) => {
    const cat = categoryMap.get(t.categoryId || "");
    return {
      category: cat?.name || "Bilinmeyen",
      color: cat?.color || "#94a3b8",
      icon: cat?.icon || "circle",
      amount: t._sum.amount || 0,
      percentage: totalExpense > 0
        ? Math.round(((t._sum.amount || 0) / totalExpense) * 100)
        : 0,
    };
  });
}
