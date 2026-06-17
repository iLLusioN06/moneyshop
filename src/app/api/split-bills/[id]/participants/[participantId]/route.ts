// =============================================
// MoneyShop - Split Bill Participant API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/split-bills/[id]/participants/[participantId] - Katılımcı ödeme durumunu güncelle
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id, participantId } = await params;
    const body = await req.json();
    const { isPaid } = body;

    // Ortak hesabın kullanıcıya ait olduğunu doğrula
    const bill = await prisma.splitBill.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!bill) {
      return NextResponse.json({ error: "Ortak hesap bulunamadı." }, { status: 404 });
    }

    // Katılımcıyı güncelle
    const participant = await prisma.splitBillParticipant.update({
      where: { id: participantId, splitBillId: id },
      data: {
        isPaid: isPaid,
        paidAt: isPaid ? new Date() : null,
      },
    });

    // Tüm katılımcıların ödeme durumunu kontrol et
    const allParticipants = await prisma.splitBillParticipant.findMany({
      where: { splitBillId: id },
    });

    const paidCount = allParticipants.filter((p) => p.isPaid).length;
    const totalCount = allParticipants.length;

    // Hesap durumunu güncelle
    let newStatus: "PENDING" | "PARTIAL" | "SETTLED" = "PENDING";
    if (paidCount === totalCount) {
      newStatus = "SETTLED";
    } else if (paidCount > 0) {
      newStatus = "PARTIAL";
    }

    await prisma.splitBill.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true, data: participant });
  } catch (error) {
    console.error("SplitBillParticipant PATCH error:", error);
    return NextResponse.json(
      { error: "Katılımcı güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
