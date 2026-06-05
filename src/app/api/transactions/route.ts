// =============================================
// MoneyShop - Transactions API (Liste & Oluşturma)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/transactions - İşlemleri listele (filtreleme + sayfalama)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // INCOME | EXPENSE | TRANSFER
    const accountId = searchParams.get("accountId");
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Filtreleri oluştur
    const where: Record<string, unknown> = {
      userId,
    };

    if (type) where.type = type;
    if (accountId) where.accountId = accountId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate);
    }
    if (search) {
      where.description = { contains: search, mode: "insensitive" };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: where as any,
        include: {
          category: true,
          account: true,
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: where as any }),
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
    console.error("Transactions GET error:", error);
    return NextResponse.json(
      { error: "İşlemler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Yeni işlem oluştur (bakiye güncellemesi ile)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { accountId, categoryId, type, amount, currency, description, date } = body;

    if (!accountId || !type || amount === undefined) {
      return NextResponse.json(
        { error: "Hesap, işlem türü ve tutar zorunludur." },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Tutar 0'dan büyük olmalıdır." },
        { status: 400 }
      );
    }

    // Hesabın kullanıcıya ait olduğunu kontrol et
    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Hesap bulunamadı." },
        { status: 404 }
      );
    }

    // İşlem ve bakiye güncellemesini transaction ile yap
    const transaction = await prisma.$transaction(async (tx) => {
      // İşlemi oluştur
      const txRecord = await tx.transaction.create({
        data: {
          accountId,
          userId,
          categoryId: categoryId || null,
          type,
          amount,
          currency: currency || account.currency,
          description: description || null,
          date: date ? new Date(date) : new Date(),
        },
      });

      // Bakiye güncellemesi
      const balanceChange =
        type === "INCOME" ? amount : type === "EXPENSE" ? -amount : 0;

      if (balanceChange !== 0) {
        await tx.financialAccount.update({
          where: { id: accountId },
          data: { balance: { increment: balanceChange } },
        });
      }

      return txRecord;
    });

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transactions POST error:", error);
    return NextResponse.json(
      { error: "İşlem oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
