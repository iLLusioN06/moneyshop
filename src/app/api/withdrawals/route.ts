// =============================================
// MoneyShop - Withdrawals API (Para Çekme)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/withdrawals - Yeni para çekme işlemi oluştur
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { accountId, amount, method, recipientIban, recipientName } = body;
    // method: "iban" | "qr" | "card"

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

    if (!["iban", "qr", "card"].includes(method)) {
      return NextResponse.json(
        { error: "Geçersiz para çekme yöntemi." },
        { status: 400 }
      );
    }

    // IBAN çekimlerinde IBAN ve alıcı adı zorunlu
    if (method === "iban" && (!recipientIban || !recipientName)) {
      return NextResponse.json(
        { error: "IBAN ve alıcı adı zorunludur." },
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

    // Para çekme işlemini transaction ile yap
    const withdrawResult = await prisma.$transaction(async (tx) => {
      // 1. Hesaptan düş
      await tx.financialAccount.update({
        where: { id: account.id },
        data: { balance: { increment: -amount } },
      });

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
    console.error("Withdrawals POST error:", error);
    return NextResponse.json(
      { error: "Para çekme işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
