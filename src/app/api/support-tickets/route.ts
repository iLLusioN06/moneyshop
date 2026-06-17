// =============================================
// MoneyShop - Support Tickets API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders } from "@/lib/utils";
import { z } from "zod";

const ticketSchema = z.object({
  subject: z.string().min(5, "Konu en az 5 karakter olmalıdır").max(200),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır").max(2000),
  category: z.enum(["GENERAL", "ACCOUNT", "TRANSACTION", "CARD", "TECHNICAL", "OTHER"]).default("GENERAL"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, data: tickets },
      { headers: getCacheHeaders(15) }
    );
  } catch (error) {
    console.error("Support Tickets GET error:", error);
    return NextResponse.json(
      { error: "Destek talepleri alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

async function createHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const validated = ticketSchema.parse(body);

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject: validated.subject,
        description: validated.description,
        category: validated.category,
        priority: validated.priority,
        status: "OPEN",
      },
    });

    // İlk mesajı oluştur
    await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        userId: session.user.id,
        message: validated.description,
        isStaff: false,
      },
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Support Ticket POST error:", error);
    return NextResponse.json(
      { error: "Destek talebi oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 30, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, createHandler);
