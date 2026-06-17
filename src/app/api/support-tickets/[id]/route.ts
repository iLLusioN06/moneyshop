// =============================================
// MoneyShop - Support Ticket Detail API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const messageSchema = z.object({
  message: z.string().min(1, "Mesaj boş olamaz").max(2000),
});

const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: session.user.id },
      include: {
        messages: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Destek talebi bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Support Ticket GET error:", error);
    return NextResponse.json(
      { error: "Destek talebi alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const validated = updateTicketSchema.parse(body);

    const existing = await prisma.supportTicket.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Destek talebi bulunamadı." }, { status: 404 });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Support Ticket PATCH error:", error);
    return NextResponse.json(
      { error: "Destek talebi güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// Mesaj ekle
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

    const existing = await prisma.supportTicket.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Destek talebi bulunamadı." }, { status: 404 });
    }

    // Talebi beklemede olarak işaretle
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

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Support Message POST error:", error);
    return NextResponse.json(
      { error: "Mesaj gönderilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.supportTicket.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Destek talebi bulunamadı." }, { status: 404 });
    }

    await prisma.supportMessage.deleteMany({ where: { ticketId: id } });
    await prisma.supportTicket.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Destek talebi silindi." });
  } catch (error) {
    console.error("Support Ticket DELETE error:", error);
    return NextResponse.json(
      { error: "Destek talebi silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
