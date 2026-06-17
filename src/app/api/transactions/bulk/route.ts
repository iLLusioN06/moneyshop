// =============================================
// MoneyShop - Bulk Transactions API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

interface BulkTransaction {
  accountId: string;
  type: string;
  amount: number;
  description?: string;
  date?: string;
  categoryId?: string;
  status?: string;
}

// POST /api/transactions/bulk - Toplu işlem oluştur
async function bulkCreateHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { transactions } = body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "İşlem listesi boş olamaz." }, { status: 400 });
    }

    if (transactions.length > 100) {
      return NextResponse.json({ error: "Tek seferde en fazla 100 işlem içe aktarılabilir." }, { status: 400 });
    }

    // Hesapların kullanıcıya ait olduğunu doğrula
    const accountIds = [...new Set(transactions.map((t: BulkTransaction) => t.accountId))];
    const accounts = await prisma.financialAccount.findMany({
      where: {
        id: { in: accountIds },
        userId: session.user.id,
      },
      select: { id: true },
    });

    const validAccountIds = new Set(accounts.map((a) => a.id));
    const invalidAccounts = accountIds.filter((id) => !validAccountIds.has(id));

    if (invalidAccounts.length > 0) {
      return NextResponse.json(
        { error: `Geçersiz hesap ID'leri: ${invalidAccounts.join(", ")}` },
        { status: 400 }
      );
    }

    // İşlemleri toplu oluştur
    const userId = session.user.id;
    const results = await prisma.$transaction(
      transactions.map((t: BulkTransaction) =>
        prisma.transaction.create({
          data: {
            userId,
            accountId: t.accountId,
            type: (t.type as "INCOME" | "EXPENSE" | "TRANSFER") || "EXPENSE",
            amount: Math.abs(Number(t.amount)),
            description: t.description || null,
            date: t.date ? new Date(t.date) : new Date(),
            categoryId: t.categoryId || null,
            status: (t.status as "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED") || "COMPLETED",
            currency: "IQD",
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        created: results.length,
        transactions: results,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("BulkTransactions POST error:", error);
    return NextResponse.json(
      { error: "Toplu işlem oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/bulk - Toplu işlem sil
async function bulkDeleteHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "İşlem ID listesi boş olamaz." }, { status: 400 });
    }

    if (ids.length > 100) {
      return NextResponse.json({ error: "Tek seferde en fazla 100 işlem silinebilir." }, { status: 400 });
    }

    // İşlemlerin kullanıcıya ait olduğunu doğrula
    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
      select: { id: true },
    });

    const validIds = transactions.map((t) => t.id);
    const deleted = await prisma.transaction.deleteMany({
      where: {
        id: { in: validIds },
      },
    });

    return NextResponse.json({
      success: true,
      data: { deleted: deleted.count },
    });
  } catch (error) {
    console.error("BulkTransactions DELETE error:", error);
    return NextResponse.json(
      { error: "Toplu işlem silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// PATCH /api/transactions/bulk - Toplu işlem güncelle
async function bulkUpdateHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const body = await req.json();
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "İşlem ID listesi boş olamaz." }, { status: 400 });
    }

    if (ids.length > 100) {
      return NextResponse.json({ error: "Tek seferde en fazla 100 güncellenebilir." }, { status: 400 });
    }

    // İşlemlerin kullanıcıya ait olduğunu doğrula
    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
      select: { id: true },
    });

    const validIds = transactions.map((t) => t.id);

    // Güncellenebilir alanlar
    const updateData: Record<string, unknown> = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.categoryId !== undefined) updateData.categoryId = updates.categoryId;
    if (updates.description !== undefined) updateData.description = updates.description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan belirtilmedi." }, { status: 400 });
    }

    const updated = await prisma.transaction.updateMany({
      where: {
        id: { in: validIds },
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: { updated: updated.count },
    });
  } catch (error) {
    console.error("BulkTransactions PATCH error:", error);
    return NextResponse.json(
      { error: "Toplu işlem güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, bulkCreateHandler);
export const DELETE = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, bulkDeleteHandler);
export const PATCH = withRateLimit({ maxRequests: 10, windowMs: 60_000 }, bulkUpdateHandler);
