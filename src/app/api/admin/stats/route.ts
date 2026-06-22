// =============================================
// MoneyShop - Admin İstatistik API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

// GET /api/admin/stats - Admin paneli istatistikleri
export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, async () => {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalAccounts,
      totalTransactions,
      monthlyTransactions,
      monthlyIncome,
      monthlyExpense,
      totalVolume,
      recentTransactions,
      weeklyTransactions,
      failedTransactions,
      transactionsByType,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.financialAccount.count(),
      prisma.transaction.count(),
      prisma.transaction.count({
        where: { date: { gte: monthStart } },
      }),
      prisma.transaction.aggregate({
        where: { type: "INCOME", date: { gte: monthStart }, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "EXPENSE", date: { gte: monthStart }, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          account: true,
        },
        orderBy: { date: "desc" },
        take: 10,
      }),
      prisma.transaction.aggregate({
        where: { date: { gte: weekAgo }, status: "COMPLETED" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.transaction.count({
        where: { status: "FAILED", date: { gte: monthStart } },
      }),
      prisma.transaction.groupBy({
        by: ["type"],
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    // Raw queries sıralı çalıştırılıyor
    const monthlyRevenue = await prisma.$queryRaw<Array<{ month: Date; type: string; total: number | null }>>`
      SELECT DATE_TRUNC('month', date) AS month, type, COALESCE(SUM(amount)::float, 0) AS total
      FROM transactions
      WHERE date >= ${sixMonthsAgo} AND type IN ('INCOME', 'EXPENSE')
      GROUP BY DATE_TRUNC('month', date), type
      ORDER BY month ASC
    `;
    const userGrowth = await prisma.$queryRaw<Array<{ month: Date; total: number | bigint | null }>>`
      SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*)::int AS total
      FROM "User"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;
    const topUsers = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT u.id, u.name, u.email, COUNT(t.id)::int AS "transactionCount", COALESCE(SUM(t.amount)::float, 0) AS "totalVolume"
      FROM "User" u
      INNER JOIN transactions t ON t."userId" = u.id
      WHERE t.status = 'COMPLETED'
      GROUP BY u.id
      ORDER BY "totalVolume" DESC
      LIMIT 10
    `;
    const transactionsByDay = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT TO_CHAR("date", 'Day') AS day, COUNT(*)::int AS count, COALESCE(SUM(amount)::float, 0) AS volume
      FROM transactions
      WHERE status = 'COMPLETED'
      GROUP BY TO_CHAR("date", 'Day'), EXTRACT(DOW FROM "date")
      ORDER BY EXTRACT(DOW FROM "date") ASC
    `;

    // Aylık gelir/gider trendini formatla
    const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const monthlyMap = new Map<string, { month: string; income: number; expense: number }>();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, { month: monthNames[d.getMonth()], income: 0, expense: 0 });
    }
    for (const row of monthlyRevenue as Array<{ month: Date; type: string; total: number | null }>) {
      const d = new Date(row.month);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const entry = monthlyMap.get(key);
      if (entry) {
        if (row.type === "INCOME") entry.income = Number(row.total ?? 0);
        if (row.type === "EXPENSE") entry.expense = Number(row.total ?? 0);
      }
    }

    // Kullanıcı büyümesini formatla
    const growthMap = new Map<string, { month: string; count: number }>();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      growthMap.set(key, { month: monthNames[d.getMonth()], count: 0 });
    }
    for (const row of userGrowth as Array<{ month: Date; total: number | bigint | null }>) {
      const d = new Date(row.month);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const entry = growthMap.get(key);
      if (entry) entry.count = row.total != null ? Number(row.total) : 0;
    }

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthIncome = await prisma.transaction.aggregate({
      where: { type: "INCOME", date: { gte: prevMonthStart, lt: monthStart }, status: "COMPLETED" },
      _sum: { amount: true },
    });

    const incomeGrowth = prevMonthIncome._sum.amount && Number(prevMonthIncome._sum.amount) > 0
      ? (((Number(monthlyIncome._sum.amount) || 0) - Number(prevMonthIncome._sum.amount)) / Number(prevMonthIncome._sum.amount)) * 100
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        avgTransactionAmount: totalTransactions > 0 ? (Number(totalVolume._sum.amount) || 0) / totalTransactions : 0,
        totalUsers: Number(totalUsers),
        activeUsers: Number(activeUsers),
        suspendedUsers: Number(totalUsers) - Number(activeUsers),
        totalAccounts: Number(totalAccounts),
        totalTransactions: Number(totalTransactions),
        monthlyTransactions: Number(monthlyTransactions),
        monthlyIncome: Number(monthlyIncome._sum.amount) || 0,
        monthlyExpense: Number(monthlyExpense._sum.amount) || 0,
        totalVolume: Number(totalVolume._sum.amount) || 0,
        incomeGrowth: Math.round(incomeGrowth * 10) / 10,
        weeklyVolume: Number(weeklyTransactions._sum.amount) || 0,
        weeklyTransactionCount: Number(weeklyTransactions._count.id) || 0,
        failedTransactions: Number(failedTransactions),
        recentTransactions: recentTransactions.map((tx) => ({
          ...tx,
          amount: Number(tx.amount),
          account: { ...tx.account, balance: Number(tx.account.balance) },
        })),
        monthlyRevenue: Array.from(monthlyMap.values()),
        userGrowth: Array.from(growthMap.values()),
        transactionsByType: (transactionsByType as Array<{ type: string; _count: { id: number }; _sum: { amount: number | null } }>)
          .filter((t) => t.type)
          .map((t) => ({
            type: t.type,
            count: t._count.id,
            volume: Number(t._sum.amount) || 0,
          })),
        topUsers: (topUsers as unknown as Array<{ id: string; name: string | null; email: string; transactionCount: unknown; totalVolume: unknown }>)
          .map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            transactionCount: Number(u.transactionCount) || 0,
            totalVolume: Number(u.totalVolume) || 0,
          })),
        transactionsByDay: (transactionsByDay as unknown as Array<{ day: string; count: unknown; volume: unknown }>)
          .map((d) => ({
            day: (d.day ?? "").trim(),
            count: Number(d.count) || 0,
            volume: Number(d.volume) || 0,
          })),
      },
    });
  } catch (error) {
    console.error("Admin stats GET error:", error);
    return NextResponse.json(
      { error: "İstatistikler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
});
