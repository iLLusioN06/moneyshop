// =============================================
// MoneyShop - Deposits API (Para Yatırma)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/deposits - Yeni para yatırma işlemi oluştur
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { accountId, amount, method } = body; // method: "iban" | "card" | "atm"

    // Validasyon
    if (!accountId || !amount || !method) {
      return NextResponse.json(
        { error: "Hesap, tutar ve yöntem zorunludur." },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Tutar 0'dan büyük olmalıdır." },
        { status: 400 }
      );
    }

    if (!["iban", "card", "atm"].includes(method)) {
      return NextResponse.json(
        { error: "Geçersiz para yatırma yöntemi." },
        { status: 400 }
      );
    }

    // Hesabı kontrol et
    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, userId, isActive: true },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Hesap bulunamadı." },
        { status: 404 }
      );
    }

    // Para yatırma işlemini transaction ile yap
    const depositResult = await prisma.$transaction(async (tx) => {
      // 1. Hesaba para ekle
      await tx.financialAccount.update({
        where: { id: account.id },
        data: { balance: { increment: amount } },
      });

      // 2. İşlem kaydı oluştur
      const methodLabels: Record<string, string> = {
        iban: "IBAN Havalesi",
        card: "Kredi/Banka Kartı",
        atm: "ATM",
      };

      const txRecord = await tx.transaction.create({
        data: {
          accountId: account.id,
          userId,
          type: "INCOME",
          amount,
          currency: account.currency,
          description: `${methodLabels[method]} ile para yatırma`,
          status: "COMPLETED",
        },
      });

      return txRecord;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Para yatırma işlemi başarıyla gerçekleştirildi.",
        data: depositResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Deposits POST error:", error);
    return NextResponse.json(
      { error: "Para yatırma işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
