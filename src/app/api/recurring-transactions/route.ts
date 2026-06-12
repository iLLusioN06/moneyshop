// =============================================
// MoneyShop - Recurring Transactions API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { withRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getRequestMetadata } from "@/lib/audit";
import { sendNotification, buildTransactionEmail } from "@/lib/email";

function calculateNextDate(frequency: string, intervalCount: number, from: Date): Date {
  const next = new Date(from);
  switch (frequency) {
    case "DAILY":
      next.setDate(next.getDate() + intervalCount);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7 * intervalCount);
      break;
    case "BIWEEKLY":
      next.setDate(next.getDate() + 14 * intervalCount);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + intervalCount);
      break;
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3 * intervalCount);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + intervalCount);
      break;
  }
  return next;
}

// GET /api/recurring-transactions - List recurring transactions
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Prisma.RecurringTransactionWhereInput = { userId: session.user.id };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.recurringTransaction.findMany({
        where,
        include: { account: true, category: true },
        orderBy: { nextDate: "asc" },
        skip,
        take: limit,
      }),
      prisma.recurringTransaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Recurring GET error:", error);
    return NextResponse.json(
      { error: "Tekrarlanan işlemler alınırken hata oluştu." },
      { status: 500 }
    );
  }
}

// POST /api/recurring-transactions - Create a recurring transaction
async function postHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const {
      accountId, categoryId, type, amount, currency, description,
      frequency, intervalCount, dayOfMonth, dayOfWeek,
      startDate, endDate, totalOccurrences,
      transferRecipientName, transferRecipientIban, transferRecipientBank, recipientUserId,
    } = body;

    if (!accountId || !type || amount === undefined || !frequency || !startDate) {
      return NextResponse.json(
        { error: "Hesap, işlem türü, tutar, sıklık ve başlangıç tarihi zorunludur." },
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
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    }

    const start = new Date(startDate);
    const nextDate = calculateNextDate(frequency, intervalCount || 1, start);

    const recurringTx = await prisma.recurringTransaction.create({
      data: {
        userId,
        accountId,
        categoryId: categoryId || null,
        type,
        amount,
        currency: currency || account.currency,
        description: description || null,
        frequency,
        intervalCount: intervalCount || 1,
        dayOfMonth: dayOfMonth || null,
        dayOfWeek: dayOfWeek || null,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextDate,
        totalOccurrences: totalOccurrences || null,
        transferRecipientName: transferRecipientName || null,
        transferRecipientIban: transferRecipientIban || null,
        transferRecipientBank: transferRecipientBank || null,
        recipientUserId: recipientUserId || null,
        status: "ACTIVE",
      },
    });

    // Denetim günlüğü
    const meta = getRequestMetadata(req);
    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      entity: "RECURRING_TRANSACTION",
      entityId: recurringTx.id,
      details: { type, amount, frequency, description },
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    // E-posta bildirimi (arka planda, hata yutulur)
    const userName = session.user?.name || "Kullanıcı";
    const userEmail = session.user?.email || "";
    sendNotification(userId, "TRANSACTION", () =>
      buildTransactionEmail({
        to: userEmail,
        userName,
        type,
        amount,
        currency: currency || account.currency,
        description: description || "Tekrarlanan işlem oluşturuldu",
        accountName: account.name,
        date: recurringTx.createdAt,
      })
    ).catch(() => {});

    return NextResponse.json(
      { success: true, data: recurringTx },
      { status: 201 }
    );
  } catch (error) {
    console.error("Recurring POST error:", error);
    return NextResponse.json(
      { error: "Tekrarlanan işlem oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, postHandler);
