// =============================================
// MoneyShop - Budgets API (Liste & Oluşturma)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCacheHeaders } from "@/lib/utils";

// GET /api/budgets - Bütçeleri listele (harcama ilerlemesi ile)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    // Tek sorguyla tüm dönem harcamalarını al (N+1 önlemi)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const categoryIds = [...new Set(budgets.map((b) => b.categoryId))];

    const spentAggregates = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        categoryId: { in: categoryIds },
        type: "EXPENSE",
        date: { gte: yearStart },
      },
      _sum: { amount: true },
    });

    const spentMap = new Map(spentAggregates.map((s) => [s.categoryId, Number(s._sum.amount) || 0]));

    const budgetsWithSpent = budgets.map((budget) => {
      let periodStart: Date;
      switch (budget.period) {
        case "WEEKLY":
          periodStart = weekStart;
          break;
        case "YEARLY":
          periodStart = yearStart;
          break;
        case "MONTHLY":
        default:
          periodStart = monthStart;
      }

      const totalSpent = spentMap.get(budget.categoryId) || 0;

      return {
        ...budget,
        spent: totalSpent,
      };
    });

    return NextResponse.json({ success: true, data: budgetsWithSpent }, { headers: getCacheHeaders(30) });
  } catch (error) {
    console.error("Budgets GET error:", error);
    return NextResponse.json(
      { error: "Bütçeler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Yeni bütçe oluştur
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { categoryId, amount, currency, period, startDate, endDate } = body;

    if (!categoryId || amount === undefined) {
      return NextResponse.json(
        { error: "Kategori ve bütçe tutarı zorunludur." },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Bütçe tutarı 0'dan büyük olmalıdır." },
        { status: 400 }
      );
    }

    // Kategorinin kullanıcıya ait olduğunu kontrol et
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı." },
        { status: 404 }
      );
    }

    // Aynı kategori ve dönem için bütçe var mı kontrol et
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId,
        period: period || "MONTHLY",
        endDate: null,
      },
    });

    if (existingBudget) {
      return NextResponse.json(
        { error: "Bu kategori için zaten aktif bir bütçe bulunuyor." },
        { status: 409 }
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId,
        amount,
        currency: currency || "TRY",
        period: period || "MONTHLY",
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: { category: true },
    });

    return NextResponse.json(
      { success: true, data: budget },
      { status: 201 }
    );
  } catch (error) {
    console.error("Budgets POST error:", error);
    return NextResponse.json(
      { error: "Bütçe oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
