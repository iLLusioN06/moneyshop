// =============================================
// MoneyShop - Withdrawals API (Para Çekme)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { createWithdrawalSchema, validateRequest } from "@/lib/validations";

async function handler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const parsed = validateRequest(createWithdrawalSchema, body);
    if (!parsed.success) return parsed.response;

    const { accountId, amount, method, recipientIban, recipientName } = parsed.data;

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

    // Para çekme işlemini transaction ile yap (bakiye kontrolü transaction içinde)
    const withdrawResult = await prisma.$transaction(async (tx) => {
      // 1. Hesaptan düş (bakiye kontrolü ile birlikte)
      const updatedAccount = await tx.financialAccount.updateMany({
        where: { id: account.id, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });

      if (updatedAccount.count === 0) {
        throw new Error("Yetersiz bakiye.");
      }

      // 2. İşlem kaydı oluştur
      const methodLabels: Record<string, string> = {
        iban: "IBAN",
        qr: "QR Kod",
        card: "MoneyShop Card",
      };

      let description: string;
      if (method === "iban") {
        description = `${recipientName} adlı alıcıya ${methodLabels[method]} ile para çekme`;
      } else {
        description = `${methodLabels[method]} ile para çekme`;
      }

      const txRecord = await tx.transaction.create({
        data: {
          accountId: account.id,
          userId,
          type: "EXPENSE",
          amount,
          currency: account.currency,
          description,
          status: "COMPLETED",
          ...(method === "iban"
            ? { recipientName, recipientIban }
            : {}),
        },
      });

      return txRecord;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Para çekme işlemi başarıyla gerçekleştirildi.",
        data: withdrawResult,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Para çekme işlemi sırasında bir hata oluştu.";
    if (message === "Yetersiz bakiye.") {
      return NextResponse.json({ error: "Yetersiz bakiye." }, { status: 400 });
    }
    console.error("Withdrawals POST error:", error);
    return NextResponse.json(
      { error: "Para çekme işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, handler);
