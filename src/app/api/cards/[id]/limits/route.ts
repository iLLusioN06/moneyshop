// =============================================
// MoneyShop - Card Limits API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { maskCardNumber, tryDecryptCardNumber } from "@/lib/card-utils";

const limitsSchema = z
  .object({
    dailyLimit: z
      .number()
      .positive("Günlük limit 0'dan büyük olmalıdır.")
      .max(5000000, "Günlük limit 5.000.000'den büyük olamaz.")
      .optional(),
    monthlyLimit: z
      .number()
      .positive("Aylık limit 0'dan büyük olmalıdır.")
      .max(50000000, "Aylık limit 50.000.000'den büyük olamaz.")
      .optional(),
  })
  .strict()
  .refine((data) => data.dailyLimit !== undefined || data.monthlyLimit !== undefined, {
    message: "Güncellenecek limit belirtilmelidir.",
  });

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
    const body = await req.json();
    const validated = limitsSchema.parse(body);

    const card = await prisma.card.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!card) {
      return NextResponse.json({ error: "Kart bulunamadı." }, { status: 404 });
    }

    if (card.status === "CANCELLED") {
      return NextResponse.json(
        { error: "İptal edilmiş kartın limitleri değiştirilemez." },
        { status: 400 }
      );
    }

    const updateData: Record<string, number> = {};
    if (validated.dailyLimit !== undefined) updateData.dailyLimit = validated.dailyLimit;
    if (validated.monthlyLimit !== undefined) updateData.monthlyLimit = validated.monthlyLimit;

    const updated = await prisma.card.update({
      where: { id },
      data: updateData,
    });

    const rawCardNumber = tryDecryptCardNumber(updated.cardNumber) ?? updated.cardNumber;

    const safeCard = {
      ...updated,
      cardNumber: maskCardNumber(rawCardNumber),
      cvv: "***",
    };

    return NextResponse.json({
      success: true,
      message: "Kart limitleri başarıyla güncellendi.",
      data: safeCard,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Card Limits error:", error);
    return NextResponse.json(
      { error: "Kart limitleri güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}
