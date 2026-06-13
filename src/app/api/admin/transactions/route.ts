// =============================================
// MoneyShop - Admin İşlem İzleme API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, TransactionType, TransactionStatus } from "@prisma/client";

// GET /api/admin/transactions - Tüm kullanıcıların işlemlerini listele
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};

    if (type) where.type = type as TransactionType;
    if (status) where.status = status as TransactionStatus;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as { gte?: Date; lte?: Date }).gte = new Date(startDate);
      if (endDate) (where.date as { gte?: Date; lte?: Date }).lte = new Date(endDate);
    }
    if (search) {
      where.description = { contains: search, mode: "insensitive" };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          account: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin transactions GET error:", error);
    return NextResponse.json(
      { error: "İşlemler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
