import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

async function listHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    if (!email) {
      return NextResponse.json({ error: "E-posta adresi gerekli." }, { status: 400 });
    }

    const attempts = await prisma.loginAttempt.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        success: true,
        failureReason: true,
        ip: true,
        country: true,
        city: true,
        createdAt: true,
      },
    });

    const recentFailures = await prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });

    return NextResponse.json({
      success: true,
      data: attempts,
      recentFailures,
      isLocked: recentFailures >= 5,
    });
  } catch (error) {
    console.error("Login attempts GET error:", error);
    return NextResponse.json({ error: "Giriş denemeleri alınırken hata oluştu." }, { status: 500 });
  }
}

async function createHandler(req: Request) {
  try {
    const body = await req.json();
    const { email, success, failureReason, ip, userAgent, country, city, deviceId } = body;

    if (!email) {
      return NextResponse.json({ error: "E-posta adresi gerekli." }, { status: 400 });
    }

    const attempt = await prisma.loginAttempt.create({
      data: {
        email,
        success: success || false,
        failureReason: failureReason || null,
        ip: ip || null,
        userAgent: userAgent || null,
        country: country || null,
        city: city || null,
        deviceId: deviceId || null,
      },
    });

    return NextResponse.json({ success: true, data: { id: attempt.id } }, { status: 201 });
  } catch (error) {
    console.error("Login attempts POST error:", error);
    return NextResponse.json({ error: "Giriş denemesi kaydedilirken hata oluştu." }, { status: 500 });
  }
}

export const GET = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, createHandler);
