// =============================================
// MoneyShop - Installment Detail API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateInstallmentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  merchantName: z.string().max(200).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
});

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
    const installment = await prisma.installment.findFirst({
      where: { id, userId: session.user.id },
      include: { account: true, category: true },
    });

    if (!installment) {
      return NextResponse.json({ error: "Taksit bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...installment,
        totalAmount: Number(installment.totalAmount),
        monthlyAmount: Number(installment.monthlyAmount),
        remainingAmount: Number(installment.totalAmount) - Number(installment.monthlyAmount) * installment.paidPayments,
        progress: Math.round((installment.paidPayments / installment.totalPayments) * 100),
      },
    });
  } catch (error) {
    console.error("Installment GET error:", error);
    return NextResponse.json(
      { error: "Taksit alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

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
    const validated = updateInstallmentSchema.parse(body);

    const existing = await prisma.installment.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Taksit bulunamadı." }, { status: 404 });
    }

    const installment = await prisma.installment.update({
      where: { id },
      data: validated,
      include: { account: true, category: true },
    });

    return NextResponse.json({ success: true, data: installment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Installment PATCH error:", error);
    return NextResponse.json(
      { error: "Taksit güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

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
    const existing = await prisma.installment.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Taksit bulunamadı." }, { status: 404 });
    }

    await prisma.installment.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Taksit silindi." });
  } catch (error) {
    console.error("Installment DELETE error:", error);
    return NextResponse.json(
      { error: "Taksit silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// Taksit ödeme endpoint'i
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.installment.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Taksit bulunamadı." }, { status: 404 });
    }

    if (existing.status !== "ACTIVE") {
      return NextResponse.json({ error: "Taksit aktif değil." }, { status: 400 });
    }

    if (existing.paidPayments >= existing.totalPayments) {
      return NextResponse.json({ error: "Taksit zaten tamamlandı." }, { status: 400 });
    }

    const newPaidPayments = existing.paidPayments + 1;
    const isCompleted = newPaidPayments >= existing.totalPayments;

    // Bir sonraki ödeme tarihini hesapla (1 ay sonraki)
    const nextDate = new Date(existing.nextPaymentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);

    const installment = await prisma.installment.update({
      where: { id },
      data: {
        paidPayments: newPaidPayments,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
        nextPaymentDate: isCompleted ? existing.nextPaymentDate : nextDate,
      },
      include: { account: true, category: true },
    });

    return NextResponse.json({ success: true, data: installment });
  } catch (error) {
    console.error("Installment PAY error:", error);
    return NextResponse.json(
      { error: "Taksit ödenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
