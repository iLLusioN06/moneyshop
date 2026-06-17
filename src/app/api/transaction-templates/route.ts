// =============================================
// MoneyShop - Transaction Templates API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders } from "@/lib/utils";

// GET /api/transaction-templates - Şablonları listele
async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const templates = await prisma.transactionTemplate.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isFavorite: "desc" }, { usageCount: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: templates }, { headers: getCacheHeaders(30) });
  } catch (error) {
    console.error("TransactionTemplates GET error:", error);
    return NextResponse.json(
      { error: "Şablonlar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/transaction-templates - Yeni şablon oluştur
async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, amount, currency, description, recipientName, recipientIban, recipientBank, recipientUserId, categoryId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Şablon adı zorunludur." }, { status: 400 });
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Geçerli bir tutar girin." }, { status: 400 });
    }

    const template = await prisma.transactionTemplate.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        type: type || "TRANSFER",
        amount: Number(amount),
        currency: currency || "IQD",
        description: description || null,
        recipientName: recipientName || null,
        recipientIban: recipientIban || null,
        recipientBank: recipientBank || null,
        recipientUserId: recipientUserId || null,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error) {
    console.error("TransactionTemplates POST error:", error);
    return NextResponse.json(
      { error: "Şablon oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, createHandler);
