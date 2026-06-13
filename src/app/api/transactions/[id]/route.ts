// =============================================
// MoneyShop - Transactions API (Tekil İşlemler)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTransactionSchema, validateRequest } from "@/lib/validations";

// GET /api/transactions/[id] - İşlem detayı
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

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
      include: { category: true, account: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "İşlem bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("Transaction GET error:", error);
    return NextResponse.json(
      { error: "İşlem alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - İşlem güncelle (bakiye düzeltmesi ile)
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

    // Mevcut işlemi bul
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "İşlem bulunamadı." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = validateRequest(updateTransactionSchema, body);
    if (!parsed.success) return parsed.response;

    const { categoryId, description, date, status } = parsed.data;

    // İşlem güncellemesi (bakiye etkilemez - sadece metadata)
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(status !== undefined && { status }),
      },
      include: { category: true, account: true },
    });

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("Transaction PUT error:", error);
    return NextResponse.json(
      { error: "İşlem güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - İşlem sil (bakiyeyi geri al)
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

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "İşlem bulunamadı." },
        { status: 404 }
      );
    }

    // İşlem silme ve bakiye düzeltmesini transaction ile yap
    await prisma.$transaction(async (tx) => {
      // Bakiyeyi geri al
      const balanceRevert =
        existing.type === "INCOME"
          ? -existing.amount
          : existing.type === "EXPENSE"
            ? existing.amount
            : 0;

      if (balanceRevert !== 0) {
        await tx.financialAccount.update({
          where: { id: existing.accountId },
          data: { balance: { increment: balanceRevert } },
        });
      }

      // İşlemi sil
      await tx.transaction.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
      message: "İşlem silindi ve bakiye güncellendi.",
    });
  } catch (error) {
    console.error("Transaction DELETE error:", error);
    return NextResponse.json(
      { error: "İşlem silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
