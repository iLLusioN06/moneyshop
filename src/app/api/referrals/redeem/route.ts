import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

async function redeemHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Davet kodu gerekli." }, { status: 400 });
    }

    const referral = await prisma.referral.findUnique({ where: { code } });

    if (!referral) {
      return NextResponse.json({ error: "Geçersiz davet kodu." }, { status: 404 });
    }

    if (referral.status === "COMPLETED") {
      return NextResponse.json({ error: "Bu kod zaten kullanılmış." }, { status: 409 });
    }

    if (referral.expiresAt && referral.expiresAt < new Date()) {
      return NextResponse.json({ error: "Davet kodunun süresi dolmuş." }, { status: 410 });
    }

    if (referral.referrerId === session.user.id) {
      return NextResponse.json({ error: "Kendi kodunuzu kullanamazsınız." }, { status: 400 });
    }

    const updated = await prisma.referral.update({
      where: { id: referral.id },
      data: {
        referredId: session.user.id,
        status: "COMPLETED",
        completedAt: new Date(),
        rewardAmount: 100,
        rewardType: "CREDIT",
      },
    });

    return NextResponse.json({ success: true, data: updated, message: "Davet kodu başarıyla kullanıldı!" });
  } catch (error) {
    console.error("Referral redeem error:", error);
    return NextResponse.json({ error: "Davet kodu kullanılırken hata oluştu." }, { status: 500 });
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, redeemHandler);
