// =============================================
// MoneyShop - Payments API (Fatura Ödemeleri)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BILL_TYPE_LABELS, BillType } from "@/lib/bill-types";
import { withRateLimit } from "@/lib/rate-limit";
import { createPaymentSchema, validateRequest } from "@/lib/validations";

async function handler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const parsed = validateRequest(createPaymentSchema, body);
    if (!parsed.success) return parsed.response;

    const { accountId, amount, billType, referenceNumber } = parsed.data;

    if (!BILL_TYPE_LABELS[billType as BillType]) {
      return NextResponse.json(
        { error: "Geçersiz fatura türü." },
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

    // Ödeme işlemini transaction ile yap (bakiye kontrolü transaction içinde)
    const paymentResult = await prisma.$transaction(async (tx) => {
      // 1. Hesaptan düş (bakiye kontrolü ile birlikte)
      const updatedAccount = await tx.financialAccount.updateMany({
        where: { id: account.id, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });

      if (updatedAccount.count === 0) {
        throw new Error("Yetersiz bakiye.");
      }

      // 2. İşlem kaydı oluştur
      const billLabel = BILL_TYPE_LABELS[billType as BillType];
      const desc = referenceNumber
        ? `${billLabel} - ${referenceNumber}`
        : billLabel;

      const txRecord = await tx.transaction.create({
        data: {
          accountId: account.id,
          userId,
          type: "EXPENSE",
          amount,
          currency: account.currency,
          description: desc,
          status: "COMPLETED",
        },
      });

      return txRecord;
    });

    return NextResponse.json(
      {
        success: true,
        message: `${BILL_TYPE_LABELS[billType as BillType]} ödemesi başarıyla gerçekleştirildi.`,
        data: paymentResult,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ödeme sırasında bir hata oluştu.";
    if (message === "Yetersiz bakiye.") {
      return NextResponse.json({ error: "Yetersiz bakiye." }, { status: 400 });
    }
    console.error("Payments POST error:", error);
    return NextResponse.json(
      { error: "Ödeme sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, handler);
