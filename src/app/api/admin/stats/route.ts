// =============================================
// MoneyShop - Admin İstatistik API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats - Admin paneli istatistikleri
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

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
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers: totalUsers - activeUsers,
        totalAccounts,
        totalTransactions,
        monthlyTransactions,
        monthlyIncome: monthlyIncome._sum.amount || 0,
        monthlyExpense: monthlyExpense._sum.amount || 0,
        totalVolume: totalVolume._sum.amount || 0,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Admin stats GET error:", error);
    return NextResponse.json(
      { error: "İstatistikler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
