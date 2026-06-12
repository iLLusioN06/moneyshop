// =============================================
// MoneyShop - Cards API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function maskCardNumber(num: string): string {
  return `**** **** **** ${num.slice(-4)}`;
}

function generateCardNumber(): string {
  const prefix = "5200";
  const rest = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
  return `${prefix}${rest}`;
}

function generateCvv(): string {
  return String(Math.floor(100 + Math.random() * 899));
}

// GET /api/cards - Kullanıcının kartını getir (yoksa otomatik oluştur)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    let card = await prisma.card.findFirst({
      where: { userId: session.user.id },
    });

    // Kart yoksa (eski kayıtlar için) otomatik oluştur
    if (!card) {
      try {
        const cardNumber = generateCardNumber();
        const cvv = generateCvv();
        const now = new Date();

        card = await prisma.card.create({
          data: {
            userId: session.user.id,
            cardType: "STANDARD",
            cardNumber,
            cardHolderName: session.user.name || "Kullanıcı",
            expiryMonth: now.getMonth() + 1,
            expiryYear: now.getFullYear() + 5,
            cvv,
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

    // Hassas bilgileri maskele
    const safeCard = {
      ...card,
      cardNumber: maskCardNumber(card.cardNumber),
      cvv: "***",
      transactions,
    };

    return NextResponse.json({ success: true, data: safeCard });
  } catch (error) {
    console.error("Cards GET error:", error);
    const errMsg = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("Cards GET error:", errMsg);
    return NextResponse.json(
      { error: "Kart bilgileri alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/cards - Kart başvurusu / kart tipi değiştirme
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

      const safeCard = {
        ...updated,
        cardNumber: maskCardNumber(updated.cardNumber),
        cvv: "***",
      };

      return NextResponse.json({ success: true, data: safeCard, message: "Kart tipiniz güncellendi." });
    }

    // Yeni kart oluştur
    const cardNumber = generateCardNumber();
    const cvv = generateCvv();
    const now = new Date();

    const card = await prisma.card.create({
      data: {
        userId: session.user.id,
        cardType,
        cardNumber,
        cardHolderName: session.user.name || "Kullanıcı",
        expiryMonth: now.getMonth() + 1,
        expiryYear: now.getFullYear() + 5,
        cvv,
        status: "ACTIVE",
        dailyLimit: cardType === "GOLD" ? 250000 : cardType === "SILVER" ? 50000 : 5000,
        monthlyLimit: cardType === "GOLD" ? 1000000 : cardType === "SILVER" ? 250000 : 50000,
        currency: "IQD",
      },
    });

    const safeCard = {
      ...card,
      cardNumber: maskCardNumber(card.cardNumber),
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

// PATCH /api/cards - Kart durumu güncelle (bloke/kaldır)
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
      return NextResponse.json({ error: "Geçersiz işlem. block, unblock veya cancel kullanın." }, { status: 400 });
    }

    const updated = await prisma.card.update({
      where: { id: card.id },
      data: { status: newStatus },
    });

    const safeCard = {
      ...updated,
      cardNumber: maskCardNumber(updated.cardNumber),
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
