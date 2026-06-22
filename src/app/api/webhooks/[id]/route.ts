import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const webhook = await prisma.webhook.findFirst({
      where: { id, userId: session.user.id },
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

    if (!webhook) {
      return NextResponse.json({ error: "Webhook bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: webhook });
  } catch (error) {
    console.error("Webhook GET error:", error);
    return NextResponse.json({ error: "Webhook alınırken hata oluştu." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.webhook.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Webhook bulunamadı." }, { status: 404 });
    }

    const { url, events, isActive, description } = body;

    const updated = await prisma.webhook.update({
      where: { id },
      data: {
        ...(url !== undefined && { url }),
        ...(events !== undefined && { events }),
        ...(isActive !== undefined && { isActive }),
        ...(description !== undefined && { description }),
        ...(isActive === true && { failCount: 0 }),
      },
    });

    return NextResponse.json({ success: true, data: { id: updated.id, url: updated.url, isActive: updated.isActive } });
  } catch (error) {
    console.error("Webhook PATCH error:", error);
    return NextResponse.json({ error: "Webhook güncellenirken hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.webhook.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Webhook bulunamadı." }, { status: 404 });
    }

    await prisma.webhook.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Webhook silindi." });
  } catch (error) {
    console.error("Webhook DELETE error:", error);
    return NextResponse.json({ error: "Webhook silinirken hata oluştu." }, { status: 500 });
  }
}
