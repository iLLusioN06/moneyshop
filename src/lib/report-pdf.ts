// =============================================
// MoneyShop - Finansal Rapor PDF Üretici
// =============================================
// Sunucu-tarafı periyodik PDF rapor üretimi.
// Aylık/haftalık özet raporlar için kullanılır.
// =============================================

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Type Augmentation ───────────────────────────────────
// jspdf-autotable adds lastAutoTable to jsPDF; no @types exist.
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

// ─── Types ───────────────────────────────────────────────

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  currency: string;
  transactionCount: number;
}

export interface AccountBalance {
  name: string;
  balance: number;
  currency: string;
  type: string;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TopTransaction {
  date: Date;
  type: string;
  description: string | null;
  amount: number;
  currency: string;
  categoryName: string | null;
}

export interface ReportData {
  period: string;           // "Ocak 2025" gibi
  startDate: string;
  endDate: string;
  userName: string;
  summary: ReportSummary;
  accounts: AccountBalance[];
  categoryBreakdown: CategoryBreakdown[];
  topTransactions: TopTransaction[];
}

// ─── Text Helpers ────────────────────────────────────────

function normalizeText(text: string): string {
  const map: Record<string, string> = {
    ı: "i", İ: "I", ş: "s", Ş: "S", ç: "c", Ç: "C",
    ğ: "g", Ğ: "G", ü: "u", Ü: "U", ö: "o", Ö: "O",
    â: "a", ê: "e", î: "i",
  };
  return text.replace(/[ıİşŞçÇğĞüÜöÖâêî]/g, (ch) => map[ch] || ch);
}

function formatCurrency(amount: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function typeLabel(type: string): string {
  switch (type) {
    case "INCOME": return "Gelir";
    case "EXPENSE": return "Gider";
    case "TRANSFER": return "Transfer";
    default: return type;
  }
}

// ─── PDF Generation ──────────────────────────────────────

export function generateReportPdf(data: ReportData): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Colors
  const green: [number, number, number] = [22, 163, 74];
  const red: [number, number, number] = [220, 38, 38];
  const gray: [number, number, number] = [100, 116, 139];
  const dark: [number, number, number] = [30, 41, 59];
  const accent: [number, number, number] = [59, 130, 246]; // blue-500

  // ════════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════════
  doc.setFontSize(22);
  doc.setTextColor(...green);
  doc.setFont("helvetica", "bold");
  doc.text(normalizeText("MoneyShop"), margin, y);

  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.setFont("helvetica", "normal");
  doc.text(normalizeText("Finansal Yonetim Platformu"), margin, y + 5);

  y += 12;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // ── Title ──
  y += 10;
  doc.setFontSize(18);
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.text(normalizeText("Aylik Finansal Rapor"), margin, y);

  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.setFont("helvetica", "normal");
  doc.text(normalizeText(data.period), margin, y);
  doc.text(normalizeText("Olusturma: " + new Date().toLocaleDateString("tr-TR")), margin + 80, y);

  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(
    normalizeText("Donem: " + data.startDate + " - " + data.endDate),
    margin,
    y
  );

  // ════════════════════════════════════════════════════════
  // FINANCIAL SUMMARY
  // ════════════════════════════════════════════════════════
  y += 12;
  doc.setFontSize(13);
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.text(normalizeText("Finansal Ozet"), margin, y);

  y += 8;
  const leftX = margin;
  const midX = margin + 55;
  const rightX = margin + 110;
  const boxW = 55;
  const boxH = 18;

  // Box helper
  function drawBox(x: number, label: string, value: string, valueColor: [number, number, number]) {
    // Background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y - 4, boxW, boxH, 2, 2, "FD");

    // Label
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.setFont("helvetica", "normal");
    doc.text(normalizeText(label), x + 4, y + 1);

    // Value
    doc.setFontSize(11);
    doc.setTextColor(...valueColor);
    doc.setFont("helvetica", "bold");
    doc.text(normalizeText(value), x + 4, y + 11);
  }

  drawBox(leftX, "Toplam Gelir", `+${formatCurrency(data.summary.totalIncome, data.summary.currency)}`, green);
  drawBox(midX, "Toplam Gider", `-${formatCurrency(data.summary.totalExpense, data.summary.currency)}`, red);
  drawBox(rightX, "Net Durum", formatCurrency(data.summary.netBalance, data.summary.currency),
    data.summary.netBalance >= 0 ? green : red);

  y += boxH + 4;
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.setFont("helvetica", "normal");
  doc.text(
    normalizeText(`Toplam ${data.summary.transactionCount} islem, ${data.summary.transactionCount > 0 ? data.period : "bu donemde islem bulunmamaktadir"}`),
    margin,
    y
  );

  // ════════════════════════════════════════════════════════
  // ACCOUNT BALANCES
  // ════════════════════════════════════════════════════════
  if (data.accounts.length > 0) {
    y += 12;
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text(normalizeText("Hesap Bakiyeleri"), margin, y);

    y += 4;
    autoTable(doc, {
      startY: y,
      head: [[normalizeText("Hesap Adi"), normalizeText("Tur"), normalizeText("Bakiye")]],
      body: data.accounts.map((a) => [
        normalizeText(a.name),
        normalizeText(typeLabel(a.type)),
        `${formatCurrency(a.balance, a.currency)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      tableLineColor: 220,
      tableLineWidth: 0.3,
    });

    y = doc.lastAutoTable!.finalY + 8;
  }

  // ════════════════════════════════════════════════════════
  // CATEGORY BREAKDOWN
  // ════════════════════════════════════════════════════════
  if (data.categoryBreakdown.length > 0) {
    y = Math.max(y, margin + 10);
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text(normalizeText("Kategori Dagilimi (Giderler)"), margin, y);

    y += 4;
    autoTable(doc, {
      startY: y,
      head: [[normalizeText("Kategori"), normalizeText("Tutar"), normalizeText("Oran")]],
      body: data.categoryBreakdown.map((c) => [
        normalizeText(c.name),
        formatCurrency(c.amount, data.summary.currency),
        `%${c.percentage.toFixed(1)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      tableLineColor: 220,
      tableLineWidth: 0.3,
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50, halign: "right" },
        2: { cellWidth: 30, halign: "right" },
      },
    });

    y = doc.lastAutoTable!.finalY + 8;
  }

  // ════════════════════════════════════════════════════════
  // TOP TRANSACTIONS
  // ════════════════════════════════════════════════════════
  if (data.topTransactions.length > 0) {
    y = Math.max(y, margin + 10);
    doc.setFontSize(13);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text(normalizeText("En Yuksek Islemler"), margin, y);

    y += 4;
    autoTable(doc, {
      startY: y,
      head: [[normalizeText("Tarih"), normalizeText("Tur"), normalizeText("Kategori"), normalizeText("Aciklama"), normalizeText("Tutar")]],
      body: data.topTransactions.map((t) => [
        formatDateShort(t.date),
        normalizeText(typeLabel(t.type)),
        normalizeText(t.categoryName || "-"),
        normalizeText(t.description || "-"),
        `${t.type === "INCOME" ? "+" : "-"}${formatCurrency(t.amount, t.currency)}`,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
      tableLineColor: 220,
      tableLineWidth: 0.3,
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 65 },
        4: { cellWidth: 35, halign: "right" },
      },
    });

    y = doc.lastAutoTable!.finalY + 8;
  }

  // ════════════════════════════════════════════════════════
  // FOOTER
  // ════════════════════════════════════════════════════════
  y = Math.max(y, 270);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.setFont("helvetica", "normal");
  doc.text(normalizeText("Bu rapor MoneyShop tarafindan otomatik olarak olusturulmustur."), margin, y);
  y += 4;
  doc.text(
    normalizeText(`${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR")} - MoneyShop`),
    margin,
    y
  );

  return Buffer.from(doc.output("arraybuffer"));
}
