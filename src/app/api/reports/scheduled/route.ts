// =============================================
// MoneyShop - Scheduled Reports API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import type { Prisma } from "@prisma/client";

const createScheduledReportSchema = z
  .object({
    name: z.string().min(1, "Rapor adı zorunludur.").max(100),
    type: z.enum(["MONTHLY", "WEEKLY", "CUSTOM"], {
      message: "Geçerli bir rapor türü seçin.",
    }),
    format: z.enum(["PDF", "CSV", "XLSX"], {
      message: "Geçerli bir format seçin.",
    }),
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"], {
      message: "Geçerli bir sıklık seçin.",
    }),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    filters: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

async function listHandler() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const reports = await prisma.scheduledReport.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error("Scheduled Reports GET error:", error);
    return NextResponse.json(
      { error: "Zamanlanmış raporlar alınırken hata oluştu." },
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
    const validated = createScheduledReportSchema.parse(body);

    // Ayda bir rapor için dayOfMonth zorunlu
    if (validated.frequency === "MONTHLY" && !validated.dayOfMonth) {
      return NextResponse.json(
        { error: "Aylık raporlar için gün numarası (dayOfMonth) zorunludur." },
        { status: 400 }
      );
    }

    // Haftada bir rapor için dayOfWeek zorunlu
    if (validated.frequency === "WEEKLY" && validated.dayOfWeek === undefined) {
      return NextResponse.json(
        { error: "Haftalık raporlar için gün (dayOfWeek) zorunludur." },
        { status: 400 }
      );
    }

    // Bir sonraki gönderim zamanını hesapla
    const now = new Date();
    let nextSendAt = new Date(now);

    if (validated.frequency === "MONTHLY") {
      nextSendAt.setDate(validated.dayOfMonth!);
      if (nextSendAt <= now) {
        nextSendAt.setMonth(nextSendAt.getMonth() + 1);
      }
    } else if (validated.frequency === "WEEKLY") {
      const currentDay = now.getDay();
      const targetDay = validated.dayOfWeek!;
      const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
      nextSendAt.setDate(now.getDate() + daysUntil);
    } else {
      // DAILY — yarın
      nextSendAt.setDate(now.getDate() + 1);
      nextSendAt.setHours(8, 0, 0, 0);
    }

    const report = await prisma.scheduledReport.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        type: validated.type,
        format: validated.format,
        frequency: validated.frequency,
        dayOfMonth: validated.dayOfMonth,
        dayOfWeek: validated.dayOfWeek,
        filters: (validated.filters || {}) as Prisma.InputJsonValue,
        nextSendAt,
      },
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Scheduled Reports POST error:", error);
    return NextResponse.json(
      { error: "Zamanlanmış rapor oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 20, windowMs: 60_000 }, listHandler);
export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, createHandler);
