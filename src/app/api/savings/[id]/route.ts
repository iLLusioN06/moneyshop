// =============================================
// MoneyShop - Savings Goal Detail API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/savings/:id - Tek hedef getir
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!goal) {
      return NextResponse.json({ error: "Birikim hedefi bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: goal });
  } catch (error) {
    console.error("Savings goal GET error:", error);
    return NextResponse.json(
      { error: "Birikim hedefi alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PATCH /api/savings/:id - Hedef güncelle (tutar ekle)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Birikim hedefi bulunamadı." }, { status: 404 });
    }

    const { name, description, targetAmount, currentAmount, currency, icon, color, deadline } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description || null;
    if (targetAmount !== undefined) updateData.targetAmount = targetAmount;
    if (currentAmount !== undefined) updateData.currentAmount = currentAmount;
    if (currency !== undefined) updateData.currency = currency;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

    // Tamamlanma kontrolü
    const newTarget = updateData.targetAmount !== undefined ? Number(updateData.targetAmount) : Number(existing.targetAmount);
    const newCurrent = updateData.currentAmount !== undefined ? Number(updateData.currentAmount) : Number(existing.currentAmount);

    if (newCurrent >= newTarget && !existing.isCompleted) {
      updateData.isCompleted = true;
      updateData.completedAt = new Date();
    }

    const updated = await prisma.savingsGoal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Savings goal PATCH error:", error);
    return NextResponse.json(
      { error: "Birikim hedefi güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/savings/:id - Hedef sil
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Birikim hedefi bulunamadı." }, { status: 404 });
    }

    await prisma.savingsGoal.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Birikim hedefi silindi." });
  } catch (error) {
    console.error("Savings goal DELETE error:", error);
    return NextResponse.json(
      { error: "Birikim hedefi silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
