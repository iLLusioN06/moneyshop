// =============================================
// MoneyShop - Transaction Template Detail API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/transaction-templates/:id - Şablon güncelle
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.transactionTemplate.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Şablon bulunamadı." }, { status: 404 });
    }

    const body = await req.json();
    const { name, type, amount, currency, description, recipientName, recipientIban, recipientBank, recipientUserId, categoryId, isFavorite } = body;

    const updated = await prisma.transactionTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(type !== undefined && { type }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(currency !== undefined && { currency }),
        ...(description !== undefined && { description: description || null }),
        ...(recipientName !== undefined && { recipientName: recipientName || null }),
        ...(recipientIban !== undefined && { recipientIban: recipientIban || null }),
        ...(recipientBank !== undefined && { recipientBank: recipientBank || null }),
        ...(recipientUserId !== undefined && { recipientUserId: recipientUserId || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(isFavorite !== undefined && { isFavorite }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("TransactionTemplate PATCH error:", error);
    return NextResponse.json(
      { error: "Şablon güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/transaction-templates/:id - Şablon sil
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.transactionTemplate.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Şablon bulunamadı." }, { status: 404 });
    }

    await prisma.transactionTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Şablon silindi." });
  } catch (error) {
    console.error("TransactionTemplate DELETE error:", error);
    return NextResponse.json(
      { error: "Şablon silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
