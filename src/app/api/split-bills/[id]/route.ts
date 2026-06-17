// =============================================
// MoneyShop - Split Bill Detail API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/split-bills/[id] - Ortak hesap detayı
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;

    const bill = await prisma.splitBill.findFirst({
      where: { id, userId: session.user.id },
      include: {
        participants: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Ortak hesap bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: bill });
  } catch (error) {
    console.error("SplitBill GET error:", error);
    return NextResponse.json(
      { error: "Ortak hesap alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PATCH /api/split-bills/[id] - Ortak hesap güncelle
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, totalAmount, currency, category, status, date, participants } = body;

    const existing = await prisma.splitBill.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ortak hesap bulunamadı." }, { status: 404 });
    }

    // Katılımcılar güncellenecekse
    if (participants && Array.isArray(participants)) {
      // Mevcut katılımcıları sil ve yenilerini ekle
      await prisma.splitBillParticipant.deleteMany({
        where: { splitBillId: id },
      });

      const bill = await prisma.splitBill.update({
        where: { id },
        data: {
          title: title !== undefined ? title.trim() : undefined,
          description: description !== undefined ? description : undefined,
          totalAmount: totalAmount !== undefined ? Number(totalAmount) : undefined,
          currency: currency !== undefined ? currency : undefined,
          category: category !== undefined ? category : undefined,
          status: status !== undefined ? status : undefined,
          date: date !== undefined ? new Date(date) : undefined,
          participants: {
            create: participants.map((p: { name: string; email?: string; userId?: string; amount: number; isPaid?: boolean }) => ({
              name: p.name.trim(),
              email: p.email || null,
              userId: p.userId || null,
              amount: Number(p.amount),
              isPaid: p.isPaid || false,
            })),
          },
        },
        include: {
          participants: true,
        },
      });

      return NextResponse.json({ success: true, data: bill });
    }

    // Sadece temel alanları güncelle
    const bill = await prisma.splitBill.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? description : undefined,
        totalAmount: totalAmount !== undefined ? Number(totalAmount) : undefined,
        currency: currency !== undefined ? currency : undefined,
        category: category !== undefined ? category : undefined,
        status: status !== undefined ? status : undefined,
        date: date !== undefined ? new Date(date) : undefined,
      },
      include: {
        participants: true,
      },
    });

    return NextResponse.json({ success: true, data: bill });
  } catch (error) {
    console.error("SplitBill PATCH error:", error);
    return NextResponse.json(
      { error: "Ortak hesap güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/split-bills/[id] - Ortak hesap sil
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.splitBill.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ortak hesap bulunamadı." }, { status: 404 });
    }

    await prisma.splitBill.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Ortak hesap silindi." });
  } catch (error) {
    console.error("SplitBill DELETE error:", error);
    return NextResponse.json(
      { error: "Ortak hesap silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
