// =============================================
// MoneyShop - Card Freeze/Unfreeze API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { maskCardNumber, tryDecryptCardNumber } from "@/lib/card-utils";

const freezeSchema = z
  .object({
    action: z.enum(["freeze", "unfreeze"], {
      message: "Geçersiz işlem. freeze veya unfreeze kullanın.",
    }),
  })
  .strict();

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
    const validated = freezeSchema.parse(body);

    const card = await prisma.card.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!card) {
      return NextResponse.json({ error: "Kart bulunamadı." }, { status: 404 });
    }

    if (card.status === "CANCELLED") {
      return NextResponse.json(
        { error: "İptal edilmiş kart dondurulamaz/kaldırılamaz." },
        { status: 400 }
      );
    }

    const newStatus = validated.action === "freeze" ? "BLOCKED" : "ACTIVE";

    if (card.status === newStatus) {
      return NextResponse.json(
        {
          error: validated.action === "freeze"
            ? "Kart zaten dondurulmuş."
            : "Kart zaten aktif.",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.card.update({
      where: { id },
      data: { status: newStatus },
    });

    const rawCardNumber = tryDecryptCardNumber(updated.cardNumber) ?? updated.cardNumber;

    const safeCard = {
      ...updated,
      cardNumber: maskCardNumber(rawCardNumber),
      cvv: "***",
    };

    return NextResponse.json({
      success: true,
      message: validated.action === "freeze"
        ? "Kart başarıyla donduruldu."
        : "Kart başarıyla aktif hale getirildi.",
      data: safeCard,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Card Freeze error:", error);
    return NextResponse.json(
      { error: "Kart dondurma/kaldırma işleminde hata oluştu." },
      { status: 500 }
    );
  }
}
