// =============================================
// MoneyShop - Payments API (Fatura Ödemeleri)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BILL_TYPE_LABELS, BillType } from "@/lib/bill-types";

// POST /api/payments - Fatura ödemesi yap
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { accountId, amount, billType, referenceNumber } = body;

    // Validasyon
    if (!accountId || !amount || !billType) {
      return NextResponse.json(
        { error: "Hesap, tutar ve fatura türü zorunludur." },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Tutar 0'dan büyük olmalıdır." },
        { status: 400 }
      );
    }

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

    // Bakiye kontrolü
    if (account.balance < amount) {
      return NextResponse.json(
        { error: "Yetersiz bakiye." },
        { status: 400 }
      );
    }

    // Ödeme işlemini transaction ile yap
    const paymentResult = await prisma.$transaction(async (tx) => {
      // 1. Hesaptan düş
      await tx.financialAccount.update({
        where: { id: account.id },
        data: { balance: { increment: -amount } },
      });

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
    console.error("Payments POST error:", error);
    return NextResponse.json(
      { error: "Ödeme sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
