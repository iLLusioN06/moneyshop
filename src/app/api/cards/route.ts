// =============================================
// MoneyShop - Cards API
// =============================================
// Card numbers and CVVs are encrypted at rest using AES-256-GCM.
// Card numbers use deterministic encryption to preserve @unique constraint.
// CVVs use random IV encryption (no search needed).
// Generated card numbers pass the Luhn checksum algorithm.
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateCardNumber,
  generateCvv,
  encryptCardNumber,
  decryptCardNumber,
  encryptCvv,
  maskCardNumber,
  tryDecryptCardNumber,
  isEncrypted,
} from "@/lib/card-utils";

// ─── GET /api/cards ─────────────────────────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    let card = await prisma.card.findFirst({
      where: { userId: session.user.id },
    });

    // Kart yoksa otomatik oluştur
    if (!card) {
      try {
        const plainCardNumber = generateCardNumber();
        const plainCvv = generateCvv();

        card = await prisma.card.create({
          data: {
            userId: session.user.id,
            cardType: "STANDARD",
            cardNumber: encryptCardNumber(plainCardNumber),
            cardHolderName: session.user.name || "Kullanıcı",
            expiryMonth: new Date().getMonth() + 1,
            expiryYear: new Date().getFullYear() + 5,
            cvv: encryptCvv(plainCvv),
            status: "ACTIVE",
            dailyLimit: 5000,
            monthlyLimit: 50000,
            currency: "IQD",
          },
        });
      } catch {
        return NextResponse.json(
          { error: "Kart oluşturulamadı. Lütfen çıkış yapıp tekrar giriş yapın." },
          { status: 400 }
        );
      }
    }

    // Transactions'ları ayrı çek
    const transactions = await prisma.transaction.findMany({
      where: { cardId: card.id },
      take: 10,
      orderBy: { date: "desc" },
    });

    // Kart numarasını deşifre et (maskeleneceği için)
    const rawCardNumber = tryDecryptCardNumber(card.cardNumber) ?? card.cardNumber;

    // Hassas bilgileri maskele
    const safeCard = {
      ...card,
      cardNumber: maskCardNumber(rawCardNumber),
      cvv: "***",
      transactions,
    };

    return NextResponse.json({ success: true, data: safeCard });
  } catch (error) {
    console.error("Cards GET error:", error);
    return NextResponse.json(
      { error: "Kart bilgileri alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// ─── POST /api/cards (kart tipi değiştirme / yeni kart) ─

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { cardType } = body;

    if (!cardType || !["STANDARD", "SILVER", "GOLD"].includes(cardType)) {
      return NextResponse.json(
        { error: "Geçersiz kart tipi. STANDARD, SILVER veya GOLD olmalıdır." },
        { status: 400 }
      );
    }

    const existing = await prisma.card.findFirst({
      where: { userId: session.user.id },
    });

    if (existing) {
      // Mevcut kartın tipini güncelle
      const updated = await prisma.card.update({
        where: { id: existing.id },
        data: { cardType },
      });

      // Kart numarasını maskeli göster
      const rawCardNumber = tryDecryptCardNumber(updated.cardNumber) ?? updated.cardNumber;

      const safeCard = {
        ...updated,
        cardNumber: maskCardNumber(rawCardNumber),
        cvv: "***",
      };

      return NextResponse.json({ success: true, data: safeCard, message: "Kart tipiniz güncellendi." });
    }

    // Yeni kart oluştur
    const plainCardNumber = generateCardNumber();
    const plainCvv = generateCvv();

    const card = await prisma.card.create({
      data: {
        userId: session.user.id,
        cardType,
        cardNumber: encryptCardNumber(plainCardNumber),
        cardHolderName: session.user.name || "Kullanıcı",
        expiryMonth: new Date().getMonth() + 1,
        expiryYear: new Date().getFullYear() + 5,
        cvv: encryptCvv(plainCvv),
        status: "ACTIVE",
        dailyLimit: cardType === "GOLD" ? 250000 : cardType === "SILVER" ? 50000 : 5000,
        monthlyLimit: cardType === "GOLD" ? 1000000 : cardType === "SILVER" ? 250000 : 50000,
        currency: "IQD",
      },
    });

    const safeCard = {
      ...card,
      cardNumber: maskCardNumber(plainCardNumber),
      cvv: "***",
    };

    return NextResponse.json({ success: true, data: safeCard }, { status: 201 });
  } catch (error) {
    console.error("Cards POST error:", error);
    return NextResponse.json(
      { error: "Kart oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/cards (bloke/kaldır/iptal) ──────────────

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    const card = await prisma.card.findFirst({
      where: { userId: session.user.id },
    });

    if (!card) {
      return NextResponse.json({ error: "Kart bulunamadı." }, { status: 404 });
    }

    let newStatus = card.status;
    if (action === "block") newStatus = "BLOCKED";
    else if (action === "unblock") newStatus = "ACTIVE";
    else if (action === "cancel") newStatus = "CANCELLED";
    else {
      return NextResponse.json(
        { error: "Geçersiz işlem. block, unblock veya cancel kullanın." },
        { status: 400 }
      );
    }

    const updated = await prisma.card.update({
      where: { id: card.id },
      data: { status: newStatus },
    });

    const rawCardNumber = tryDecryptCardNumber(updated.cardNumber) ?? updated.cardNumber;

    const safeCard = {
      ...updated,
      cardNumber: maskCardNumber(rawCardNumber),
      cvv: "***",
    };

    return NextResponse.json({ success: true, data: safeCard });
  } catch (error) {
    console.error("Cards PATCH error:", error);
    return NextResponse.json(
      { error: "Kart güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
