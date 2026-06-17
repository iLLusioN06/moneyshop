// =============================================
// MoneyShop - Transaction Export API
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { withRateLimit } from "@/lib/rate-limit";

// GET /api/transactions/export - İşlemleri dışa aktar (CSV format)
async function exportHandler(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const type = searchParams.get("type") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const accountId = searchParams.get("accountId") || "";

    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
    };

    if (type && ["INCOME", "EXPENSE", "TRANSFER"].includes(type)) {
      where.type = type as "INCOME" | "EXPENSE" | "TRANSFER";
    }
    if (accountId) where.accountId = accountId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as { gte?: Date; lte?: Date }).gte = new Date(startDate);
      if (endDate) (where.date as { gte?: Date; lte?: Date }).lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: "desc" },
      take: 10000, // Maksimum 10 bin kayıt
    });

    if (format === "json") {
      return NextResponse.json({
        success: true,
        data: transactions.map((t) => ({
          id: t.id,
          date: t.date.toISOString(),
          type: t.type,
          amount: Number(t.amount),
          currency: t.currency,
          description: t.description || "",
          category: t.category?.name || "",
          account: t.account?.name || "",
          status: t.status,
        })),
      });
    }

    // CSV format
    const headers = ["Tarih", "Tür", "Tutar", "Para Birimi", "Açıklama", "Kategori", "Hesap", "Durum"];
    const rows = transactions.map((t) => [
      t.date.toLocaleDateString("tr-TR"),
      t.type === "INCOME" ? "Gelir" : t.type === "EXPENSE" ? "Gider" : "Transfer",
      Number(t.amount).toFixed(2),
      t.currency,
      t.description || "",
      t.category?.name || "",
      t.account?.name || "",
      t.status === "COMPLETED" ? "Tamamlandı" : t.status === "PENDING" ? "Bekliyor" : t.status,
    ]);

    const csvContent = [
      "\uFEFF" + headers.join(";"), // BOM for Excel UTF-8
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="islemler_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("TransactionExport GET error:", error);
    return NextResponse.json(
      { error: "Dışa aktarma sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit({ maxRequests: 5, windowMs: 60_000 }, exportHandler);
