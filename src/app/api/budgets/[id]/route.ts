// =============================================
// MoneyShop - Budgets API (Tekil İşlemler)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/budgets/[id] - Bütçe detayı
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;

    const budget = await prisma.budget.findFirst({
      where: { id, userId: session.user.id },
      include: { category: true },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Bütçe bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error("Budget GET error:", error);
    return NextResponse.json(
      { error: "Bütçe alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PUT /api/budgets/[id] - Bütçe güncelle
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.budget.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bütçe bulunamadı." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { categoryId, amount, currency, period, startDate, endDate } = body;

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(amount !== undefined && { amount }),
        ...(currency !== undefined && { currency }),
        ...(period !== undefined && { period }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error("Budget PUT error:", error);
    return NextResponse.json(
      { error: "Bütçe güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[id] - Bütçe sil
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.budget.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Bütçe bulunamadı." },
        { status: 404 }
      );
    }

    await prisma.budget.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Bütçe silindi.",
    });
  } catch (error) {
    console.error("Budget DELETE error:", error);
    return NextResponse.json(
      { error: "Bütçe silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
