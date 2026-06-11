// =============================================
// MoneyShop - Transaction Reports API (CSV Export)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");
    const accountId = searchParams.get("accountId");

    const where: Prisma.TransactionWhereInput = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as { gte?: Date; lte?: Date }).gte = new Date(startDate);
      if (endDate) (where.date as { gte?: Date; lte?: Date }).lte = new Date(endDate);
    }
    if (type) where.type = type;
    if (accountId) where.accountId = accountId;

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true, account: true },
      orderBy: { date: "desc" },
    });

    if (format === "json") {
      return NextResponse.json({ success: true, data: transactions });
    }

    // CSV format
    const headers = [
      "Tarih",
      "İşlem Türü",
      "Tutar",
      "Para Birimi",
      "Açıklama",
      "Durum",
      "Kategori",
      "Hesap",
      "Alıcı Adı",
      "Alıcı IBAN",
      "Alıcı Banka",
    ];

    const typeLabels: Record<string, string> = {
      INCOME: "Gelir",
      EXPENSE: "Gider",
      TRANSFER: "Transfer",
    };

    const rows = transactions.map((tx) => [
      tx.date.toISOString().split("T")[0],
      typeLabels[tx.type] || tx.type,
      tx.amount.toString(),
      tx.currency,
      `"${(tx.description || "").replace(/"/g, '""')}"`,
      tx.status,
      `"${(tx.category?.name || "").replace(/"/g, '""')}"`,
      `"${(tx.account?.name || "").replace(/"/g, '""')}"`,
      `"${(tx.recipientName || "").replace(/"/g, '""')}"`,
      tx.recipientIban || "",
      tx.recipientBank || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    // UTF-8 BOM for Turkish characters
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="islem-raporu-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json(
      { error: "Rapor oluşturulurken hata oluştu." },
      { status: 500 }
    );
  }
}
