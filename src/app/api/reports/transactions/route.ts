// =============================================
// MoneyShop - Transaction Export API (CSV / XLSX)
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma, TransactionType } from "@prisma/client";
import * as XLSX from "xlsx";

function buildWhere(userId: string, searchParams: URLSearchParams): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const type = searchParams.get("type");
  const accountId = searchParams.get("accountId");

  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as { gte?: Date; lte?: Date }).gte = new Date(startDate);
    if (endDate) (where.date as { gte?: Date; lte?: Date }).lte = new Date(endDate);
  }
  if (type) where.type = type as TransactionType;
  if (accountId) where.accountId = accountId;

  return where;
}

function buildExportData(transactions: Array<Record<string, unknown>>) {
  const typeLabels: Record<string, string> = {
    INCOME: "Gelir",
    EXPENSE: "Gider",
    TRANSFER: "Transfer",
  };

  return transactions.map((tx: any) => ({
    Tarih: tx.date?.toISOString()?.split("T")[0] || "",
    "İşlem Türü": typeLabels[tx.type] || tx.type || "",
    Tutar: tx.amount ?? "",
    "Para Birimi": tx.currency || "",
    Açıklama: tx.description || "",
    Durum: tx.status || "",
    Kategori: tx.category?.name || "",
    Hesap: tx.account?.name || "",
    "Alıcı Adı": tx.recipientName || "",
    "Alıcı IBAN": tx.recipientIban || "",
    "Alıcı Banka": tx.recipientBank || "",
  }));
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkilendirme gerekli." }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";

    const where = buildWhere(userId, searchParams);

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true, account: true },
      orderBy: { date: "desc" },
    });

    if (format === "json") {
      return NextResponse.json({ success: true, data: transactions });
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const exportData = buildExportData(transactions as any);

    if (format === "xlsx") {
      // XLSX — Excel binary
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Sütun genişliklerini ayarla
      worksheet["!cols"] = [
        { wch: 12 }, // Tarih
        { wch: 14 }, // İşlem Türü
        { wch: 14 }, // Tutar
        { wch: 12 }, // Para Birimi
        { wch: 30 }, // Açıklama
        { wch: 10 }, // Durum
        { wch: 16 }, // Kategori
        { wch: 16 }, // Hesap
        { wch: 20 }, // Alıcı Adı
        { wch: 26 }, // Alıcı IBAN
        { wch: 20 }, // Alıcı Banka
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "İşlemler");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="islemler-${dateStr}.xlsx"`,
        },
      });
    }

    // CSV (default)
    const headers = Object.keys(exportData[0] || {});
    const csvRows = exportData.map((row) =>
      headers.map((h) => {
        const val = String((row as Record<string, unknown>)[h] ?? "");
        return val.includes(",") || val.includes('"') || val.includes("\n")
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      })
    );

    const csvContent = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");

    // UTF-8 BOM for Turkish characters
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="islemler-${dateStr}.csv"`,
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
