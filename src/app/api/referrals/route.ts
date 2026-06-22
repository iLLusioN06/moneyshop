import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        referred: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });

    const stats = {
      total: referrals.length,
      completed: referrals.filter((r) => r.status === "COMPLETED").length,
      pending: referrals.filter((r) => r.status === "PENDING").length,
      totalReward: referrals
        .filter((r) => r.status === "COMPLETED")
        .reduce((sum, r) => sum + Number(r.rewardAmount), 0),
    };

    return NextResponse.json({ success: true, data: referrals, stats });
  } catch (error) {
    console.error("Referrals GET error:", error);
    return NextResponse.json({ error: "Referanslar alınırken hata oluştu." }, { status: 500 });
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const existing = await prisma.referral.findFirst({
      where: { referrerId: session.user.id, status: "PENDING" },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing, message: "Mevcut davet kodunuz." });
    }

    const code = `MS-${session.user.id.slice(0, 4).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const referral = await prisma.referral.create({
      data: {
        referrerId: session.user.id,
        code,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true, data: referral }, { status: 201 });
  } catch (error) {
    console.error("Referrals POST error:", error);
    return NextResponse.json({ error: "Referans kodu oluşturulurken hata oluştu." }, { status: 500 });
  }
}

export const GET = withRateLimit({ maxRequests: 20, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, createHandler);
