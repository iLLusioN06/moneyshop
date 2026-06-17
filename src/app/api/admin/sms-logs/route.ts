// =============================================
// MoneyShop - Admin SMS Log API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// GET /api/admin/sms-logs - Tüm SMS loglarını listele
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.min(100, Math.max(1, parseInt(searchParams.get("page") || "1")));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const userId = searchParams.get("userId");
    const event = searchParams.get("event");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;
    const where: Prisma.SmsLogWhereInput = {};

    if (userId) where.userId = userId;
    if (event) where.event = event;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { phone: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.smsLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.smsLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin SMS logs GET error:", error);
    return NextResponse.json(
      { error: "SMS logları alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
