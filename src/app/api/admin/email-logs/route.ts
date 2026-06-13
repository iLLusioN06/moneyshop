// =============================================
// MoneyShop - Admin E-posta Log İzleme API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/email-logs?page=1&limit=20&status=FAILED&userId=xxx
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
    const status = searchParams.get("status"); // SENT | FAILED
    const userId = searchParams.get("userId");
    const event = searchParams.get("event");
    const days = parseInt(searchParams.get("days") ?? "7", 10) || 7;

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where: Record<string, unknown> = {
      createdAt: { gte: since },
    };
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (event) where.event = event;

    // Ana sorgu + sayma işlemini paralel çalıştır
    const [logs, total, statsResult] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.emailLog.count({ where }),
      // İstatistikler
      prisma.emailLog.groupBy({
        by: ["status"],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }),
    ]);

    const stats: Record<string, number> = {};
    let totalRecent = 0;
    for (const row of statsResult) {
      stats[row.status] = row._count.id;
      totalRecent += row._count.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalSent: stats["SENT"] ?? 0,
          totalFailed: stats["FAILED"] ?? 0,
          totalRecent,
          failureRate: totalRecent > 0 ? ((stats["FAILED"] ?? 0) / totalRecent) * 100 : 0,
          since,
        },
      },
    });
  } catch (error) {
    console.error("[admin-email-logs] GET error:", error);
    return NextResponse.json(
      { error: "E-posta logları alınamadı." },
      { status: 500 }
    );
  }
}
