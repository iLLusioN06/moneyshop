import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const devices = await prisma.device.findMany({
      where: { userId: session.user.id },
      orderBy: { lastSeenAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        os: true,
        browser: true,
        ip: true,
        lastSeenAt: true,
        status: true,
        isTrusted: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: devices });
  } catch (error) {
    console.error("Devices GET error:", error);
    return NextResponse.json({ error: "Cihazlar alınırken hata oluştu." }, { status: 500 });
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { fingerprint, name, type, os, browser, ip, pushToken, metadata } = body;

    if (!fingerprint) {
      return NextResponse.json({ error: "Cihaz parmak izi zorunludur." }, { status: 400 });
    }

    const existing = await prisma.device.findUnique({ where: { fingerprint } });

    if (existing) {
      const updated = await prisma.device.update({
        where: { fingerprint },
        data: {
          lastSeenAt: new Date(),
          ip: ip || existing.ip,
          pushToken: pushToken || existing.pushToken,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const device = await prisma.device.create({
      data: {
        userId: session.user.id,
        fingerprint,
        name: name || null,
        type: type || "UNKNOWN",
        os: os || null,
        browser: browser || null,
        ip: ip || null,
        pushToken: pushToken || null,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ success: true, data: device }, { status: 201 });
  } catch (error) {
    console.error("Devices POST error:", error);
    return NextResponse.json({ error: "Cihaz kaydedilirken hata oluştu." }, { status: 500 });
  }
}

export const GET = withRateLimit({ maxRequests: 20, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, createHandler);
