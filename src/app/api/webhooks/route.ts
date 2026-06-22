import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

function generateWebhookSecret() {
  return crypto.randomBytes(32).toString("hex");
}

async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const webhooks = await prisma.webhook.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        events: true,
        isActive: true,
        description: true,
        failCount: true,
        lastTriggeredAt: true,
        lastStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: webhooks });
  } catch (error) {
    console.error("Webhooks GET error:", error);
    return NextResponse.json({ error: "Webhook'lar alınırken hata oluştu." }, { status: 500 });
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const existingCount = await prisma.webhook.count({
      where: { userId: session.user.id, isActive: true },
    });

    if (existingCount >= 10) {
      return NextResponse.json({ error: "Maksimum 10 aktif webhook oluşturabilirsiniz." }, { status: 400 });
    }

    const body = await req.json();
    const { url, events, description } = body;

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "URL ve en az bir olay gerekli." }, { status: 400 });
    }

    const secret = generateWebhookSecret();

    const webhook = await prisma.webhook.create({
      data: {
        userId: session.user.id,
        url,
        secret,
        events,
        description: description || null,
      },
    });

    return NextResponse.json(
      { success: true, data: { id: webhook.id, url: webhook.url, secret: webhook.secret, events: webhook.events },
        message: "Webhook oluşturuldu. Secret'ı güvenli bir yerde saklayın." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Webhooks POST error:", error);
    return NextResponse.json({ error: "Webhook oluşturulurken hata oluştu." }, { status: 500 });
  }
}

export const GET = withRateLimit({ maxRequests: 20, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, createHandler);
