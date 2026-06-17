// =============================================
// MoneyShop - Deposits API (Para Yatırma)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createDepositSchema, validateRequest } from "@/lib/validations";

async function handler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const parsed = validateRequest(createDepositSchema, body);
    if (!parsed.success) return parsed.response;

    const { accountId, amount, method } = parsed.data;

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

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, handler);
