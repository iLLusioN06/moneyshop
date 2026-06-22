// =============================================
// MoneyShop - Support Ticket Messages API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const messageSchema = z.object({
  message: z.string().min(1, "Mesaj boş olamaz").max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = messageSchema.parse(body);

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Destek talebi bulunamadı." }, { status: 404 });
    }

    if (ticket.status === "CLOSED") {
      return NextResponse.json(
        { error: "Kapatılmış destek talebine mesaj gönderilemez." },
        { status: 400 }
      );
    }

    await prisma.supportTicket.update({
      where: { id },
      data: { status: "WAITING" },
    });

    const message = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        userId: session.user.id,
        message: validated.message,
        isStaff: false,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Support Messages POST error:", error);
    return NextResponse.json(
      { error: "Mesaj gönderilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const cursor = searchParams.get("cursor");

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Destek talebi bulunamadı." }, { status: 404 });
    }

    const messages = await prisma.supportMessage.findMany({
      where: { ticketId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
      take: limit,
      ...(cursor
        ? { skip: 1, cursor: { id: cursor } }
        : {}),
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("Support Messages GET error:", error);
    return NextResponse.json(
      { error: "Mesajlar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
