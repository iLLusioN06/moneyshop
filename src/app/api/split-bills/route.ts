// =============================================
// MoneyShop - Split Bills API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders } from "@/lib/utils";

// GET /api/split-bills - Ortak hesapları listele
async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const bills = await prisma.splitBill.findMany({
      where: { userId: session.user.id },
      include: {
        participants: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ status: "asc" }, { date: "desc" }],
    });

    return NextResponse.json({ success: true, data: bills }, { headers: getCacheHeaders(30) });
  } catch (error) {
    console.error("SplitBills GET error:", error);
    return NextResponse.json(
      { error: "Ortak hesaplar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/split-bills - Yeni ortak hesap oluştur
async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, totalAmount, currency, category, date, participants } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Başlık zorunludur." }, { status: 400 });
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return NextResponse.json({ error: "Geçerli bir tutar girin." }, { status: 400 });
    }

    if (!participants || !Array.isArray(participants) || participants.length < 1) {
      return NextResponse.json({ error: "En az bir katılımcı ekleyin." }, { status: 400 });
    }

    const bill = await prisma.splitBill.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        description: description || null,
        totalAmount: Number(totalAmount),
        currency: currency || "IQD",
        category: category || null,
        date: date ? new Date(date) : new Date(),
        participants: {
          create: participants.map((p: { name: string; email?: string; userId?: string; amount: number }) => ({
            name: p.name.trim(),
            email: p.email || null,
            userId: p.userId || null,
            amount: Number(p.amount),
          })),
        },
      },
      include: {
        participants: true,
      },
    });

    return NextResponse.json({ success: true, data: bill }, { status: 201 });
  } catch (error) {
    console.error("SplitBills POST error:", error);
    return NextResponse.json(
      { error: "Ortak hesap oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, createHandler);
