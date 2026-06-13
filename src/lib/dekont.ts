// =============================================
// MoneyShop - Dekont (Receipt) Generator
// =============================================
// PDF üretimi, e-posta içeriği ve ortak tipler.
// =============================================

import { jsPDF } from "jspdf";
import type { Transaction, FinancialAccount, Category } from "@/types";

// ─── Types ───────────────────────────────────────────────

export interface DekontData {
  transaction: Transaction & {
    account?: FinancialAccount | null;
    category?: Category | null;
  };
  userName: string;
  referenceNo: string;
}

export type DekontFormat = "pdf" | "json";

// ─── PDF Generation ─────────────────────────────────────

/**
 * Türkçe karakterleri PDF uyumlu ASCII karşılıklarına dönüştürür.
 */
function normalizeText(text: string): string {
  const map: Record<string, string> = {
    ı: "i",
    İ: "I",
    ş: "s",
    Ş: "S",
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ü: "u",
    Ü: "U",
    ö: "o",
    Ö: "O",
    â: "a",
    ê: "e",
    î: "i",
  };
  return text.replace(/[ıİşŞçÇğĞüÜöÖâêî]/g, (ch) => map[ch] || ch);
}

function typeLabel(type: string): string {
  switch (type) {
    case "INCOME":
      return "Gelir";
    case "EXPENSE":
      return "Gider";
    case "TRANSFER":
      return "Para Transferi";
    default:
      return type;
  }
}

function typeSign(type: string): string {
  return type === "INCOME" ? "+" : "-";
}

function formatCurrency(amount: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateDekontPdf(data: DekontData): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { transaction, userName, referenceNo } = data;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const primaryColor: [number, number, number] = [22, 163, 74]; // emerald-600
  const grayColor: [number, number, number] = [100, 116, 139];  // slate-500
  const darkColor: [number, number, number] = [30, 41, 59];     // slate-800

  // ── Header ──
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text(normalizeText("MoneyShop"), margin, y);

  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.setFont("helvetica", "normal");
  doc.text(normalizeText("Dijital Finans Platformu"), margin, y + 5);

  // Divider line
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  // ── Title ──
  y += 10;
  doc.setFontSize(18);
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  const titleText = normalizeText(`İşlem Dekontu - ${typeLabel(transaction.type)}`);
  doc.text(titleText, margin, y);

  // Reference
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.setFont("helvetica", "normal");
  doc.text(`Referans No: ${normalizeText(referenceNo)}`, margin, y);
  doc.text(`Düzenlenme Tarihi: ${formatDate(new Date())}`, margin + 80, y);

  // ── Transaction Details Table ──
  y += 12;
  const lineHeight = 7;
  const leftCol = margin;
  const rightCol = margin + 70;

  // Helper: draw a row
  function drawRow(label: string, value: string, isHighlight = false) {
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.setFont("helvetica", "normal");
    doc.text(normalizeText(label), leftCol, y);

    doc.setTextColor(...(isHighlight ? primaryColor : darkColor));
    doc.setFont("helvetica", isHighlight ? "bold" : "normal");
    doc.text(normalizeText(value), rightCol, y);
    y += lineHeight;
  }

  drawRow("İşlem Türü:", typeLabel(transaction.type));
  drawRow(
    "Tutar:",
    `${typeSign(transaction.type)}${formatCurrency(transaction.amount, transaction.currency)}`,
    true
  );
  drawRow("Para Birimi:", transaction.currency);
  drawRow("Tarih:", formatDate(transaction.date));
  drawRow("Durum:", transaction.status === "COMPLETED" ? "Başarılı" : transaction.status);

  if (transaction.account?.name) {
    drawRow("Hesap:", transaction.account.name);
  }
  if (transaction.category?.name) {
    drawRow("Kategori:", transaction.category.name);
  }
  if (transaction.description) {
    drawRow("Açıklama:", transaction.description);
  }

  // Transfer bilgileri
  if (transaction.type === "TRANSFER") {
    y += 2;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.setFont("helvetica", "bold");
    doc.text(normalizeText("Transfer Bilgileri"), margin, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...darkColor);

    if (transaction.recipientName) drawRow("Alıcı Adı:", transaction.recipientName);
    if (transaction.recipientIban) drawRow("IBAN:", transaction.recipientIban);
    if (transaction.recipientBank) drawRow("Banka:", transaction.recipientBank);
    if (transaction.transferFee && transaction.transferFee > 0) {
      drawRow("Transfer Ücreti:", formatCurrency(transaction.transferFee, transaction.currency));
    }
  }

  // ── Footer ──
  y = Math.max(y + 15, 270);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.setFont("helvetica", "normal");
  doc.text(normalizeText("Bu belge MoneyShop tarafından otomatik olarak oluşturulmuştur."), margin, y);
  y += 4;
  doc.text(normalizeText("Referans No: " + referenceNo), margin, y);
  y += 4;

  const now = new Date();
  doc.text(
    normalizeText(
      `${now.toLocaleDateString("tr-TR")} ${now.toLocaleTimeString("tr-TR")} - MoneyShop`
    ),
    margin,
    y
  );

  return Buffer.from(doc.output("arraybuffer"));
}

// ─── Email Content Builder ──────────────────────────────

export function buildDekontEmail(data: DekontData): {
  subject: string;
  text: string;
} {
  const { transaction, userName, referenceNo } = data;
  const tLabel = typeLabel(transaction.type);
  const sign = typeSign(transaction.type);

  const lines = [
    `Merhaba ${userName},`,
    ``,
    `${tLabel} işleminize ait dekont ekte yer almaktadır.`,
    ``,
    `  Referans No: ${referenceNo}`,
    `  İşlem Türü: ${tLabel}`,
    `  Tutar: ${sign}${formatCurrency(transaction.amount, transaction.currency)}`,
    `  Tarih: ${formatDate(transaction.date)}`,
    `  Durum: ${transaction.status === "COMPLETED" ? "Başarılı" : transaction.status}`,
  ];

  if (transaction.account?.name) {
    lines.push(`  Hesap: ${transaction.account.name}`);
  }
  if (transaction.description) {
    lines.push(`  Açıklama: ${transaction.description}`);
  }
  if (transaction.recipientName) {
    lines.push(`  Alıcı: ${transaction.recipientName}`);
  }

  lines.push(
    ``,
    `Dekontu MoneyShop uygulamasından da görüntüleyebilirsiniz.`,
    ``,
    `İyi günler dileriz,\nMoneyShop`
  );

  return {
    subject: `[MoneyShop] ${tLabel} Dekontu - ${referenceNo}`,
    text: lines.join("\n"),
  };
}
