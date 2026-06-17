// =============================================
// MoneyShop - Savings Goals API (Birikim Hedefleri)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders } from "@/lib/utils";

// GET /api/savings - Birikim hedeflerini listele
async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const goals = await prisma.savingsGoal.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: goals }, { headers: getCacheHeaders(30) });
  } catch (error) {
    console.error("Savings GET error:", error);
    return NextResponse.json(
      { error: "Birikim hedefleri alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/savings - Yeni birikim hedefi oluştur
async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, targetAmount, currency, icon, color, deadline } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Hedef adı zorunludur." }, { status: 400 });
    }

    if (!targetAmount || targetAmount <= 0) {
      return NextResponse.json({ error: "Hedef tutarı 0'dan büyük olmalıdır." }, { status: 400 });
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description || null,
        targetAmount,
        currency: currency || "TRY",
        icon: icon || "piggy-bank",
        color: color || "#10b981",
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error) {
    console.error("Savings POST error:", error);
    return NextResponse.json(
      { error: "Birikim hedefi oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, createHandler);
