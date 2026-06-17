// =============================================
// MoneyShop - Installments API (Taksitli Ödemeler)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders } from "@/lib/utils";
import { z } from "zod";

const installmentSchema = z.object({
  accountId: z.string().min(1, "Hesap seçimi zorunludur"),
  categoryId: z.string().optional(),
  title: z.string().min(1, "Taksit açıklaması zorunludur").max(200),
  totalAmount: z.number().positive("Tutar pozitif olmalıdır"),
  totalPayments: z.number().int().min(2, "En az 2 taksit olmalıdır").max(60),
  currency: z.string().default("TRY"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih giriniz"),
  merchantName: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const installments = await prisma.installment.findMany({
      where: { userId: session.user.id },
      include: { account: true, category: true },
      orderBy: { nextPaymentDate: "asc" },
    });

    const data = installments.map((inst) => ({
      ...inst,
      totalAmount: Number(inst.totalAmount),
      monthlyAmount: Number(inst.monthlyAmount),
      remainingAmount: Number(inst.totalAmount) - Number(inst.monthlyAmount) * inst.paidPayments,
      progress: Math.round((inst.paidPayments / inst.totalPayments) * 100),
    }));

    return NextResponse.json(
      { success: true, data },
      { headers: getCacheHeaders(15) }
    );
  } catch (error) {
    console.error("Installments GET error:", error);
    return NextResponse.json(
      { error: "Taksitler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const validated = installmentSchema.parse(body);

    const monthlyAmount = Math.round((validated.totalAmount / validated.totalPayments) * 100) / 100;

    const installment = await prisma.installment.create({
      data: {
        userId: session.user.id,
        accountId: validated.accountId,
        categoryId: validated.categoryId || null,
        title: validated.title,
        totalAmount: validated.totalAmount,
        monthlyAmount,
        totalPayments: validated.totalPayments,
        paidPayments: 0,
        currency: validated.currency,
        startDate: new Date(validated.startDate),
        nextPaymentDate: new Date(validated.startDate),
        status: "ACTIVE",
        merchantName: validated.merchantName || null,
        notes: validated.notes || null,
      },
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
    console.error("Installment POST error:", error);
    return NextResponse.json(
      { error: "Taksit oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, createHandler);
