// =============================================
// MoneyShop - E-posta Bildirim Servisi
// =============================================

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@moneyshop.iq";
const APP_NAME = "MoneyShop";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!resend) {
    resend = new Resend(RESEND_API_KEY);
  }
  return resend;
}

// ─── Email Event Types ──────────────────────────────────

export type EmailEvent =
  | "TRANSACTION"
  | "TRANSFER"
  | "BUDGET_ALERT"
  | "MONTHLY_REPORT"
  | "LARGE_TRANSACTION"
  | "TEST";

// ─── Send Email ────────────────────────────────────────

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const client = getResend();
  if (!client) return null;

  try {
    const result = await client.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>"),
    });
    return result;
  } catch (err) {
    console.error("[email] Send failed:", err);
    return null;
  }
}

// ─── Template Helpers ───────────────────────────────────

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

// ─── Notification Builders ──────────────────────────────

interface TransactionNotification {
  to: string;
  userName: string;
  type: string;
  amount: number;
  currency: string;
  description?: string | null;
  accountName: string;
  date: Date | string;
}

export function buildTransactionEmail(params: TransactionNotification) {
  const typeLabel = params.type === "INCOME" ? "Gelir" : params.type === "EXPENSE" ? "Gider" : "Transfer";
  const sign = params.type === "INCOME" ? "+" : "-";

  return {
    subject: `[${APP_NAME}] Yeni ${typeLabel} İşlemi`,
    text: [
      `Merhaba ${params.userName},`,
      ``,
      `Hesabınızda yeni bir işlem gerçekleşti:`,
      ``,
      `  Tür: ${typeLabel}`,
      `  Tutar: ${sign}${formatCurrency(params.amount, params.currency)}`,
      `  Hesap: ${params.accountName}`,
      `  Açıklama: ${params.description || "-"}`,
      `  Tarih: ${formatDate(params.date)}`,
      ``,
      `MoneyShop uygulamasından detayları görüntüleyebilirsiniz.`,
      ``,
      `İyi günler dileriz,\n${APP_NAME}`,
    ].join("\n"),
  };
}

interface TransferNotification {
  to: string;
  userName: string;
  amount: number;
  currency: string;
  recipientName?: string | null;
  recipientIban?: string | null;
  fee: number;
  date: Date | string;
}

export function buildTransferEmail(params: TransferNotification) {
  return {
    subject: `[${APP_NAME}] Para Transferi Gerçekleşti`,
    text: [
      `Merhaba ${params.userName},`,
      ``,
      `Hesabınızdan bir para transferi gerçekleştirildi:`,
      ``,
      `  Tutar: -${formatCurrency(params.amount, params.currency)}`,
      params.recipientName ? `  Alıcı: ${params.recipientName}` : "",
      params.recipientIban ? `  IBAN: ${params.recipientIban}` : "",
      `  Ücret: ${formatCurrency(params.fee, params.currency)}`,
      `  Tarih: ${formatDate(params.date)}`,
      ``,
      `MoneyShop uygulamasından detayları görüntüleyebilirsiniz.`,
      ``,
      `İyi günler dileriz,\n${APP_NAME}`,
    ].filter(Boolean).join("\n"),
  };
}

interface BudgetAlertNotification {
  to: string;
  userName: string;
  categoryName: string;
  budgetAmount: number;
  spent: number;
  percentage: number;
}

export function buildBudgetAlertEmail(params: BudgetAlertNotification) {
  return {
    subject: `[${APP_NAME}] Bütçe Uyarısı: ${params.categoryName}`,
    text: [
      `Merhaba ${params.userName},`,
      ``,
      `⚠️ Bütçe limitine yaklaşıyorsunuz!`,
      ``,
      `  Kategori: ${params.categoryName}`,
      `  Bütçe: ${formatCurrency(params.budgetAmount)}`,
      `  Harcanan: ${formatCurrency(params.spent)}`,
      `  Oran: %${params.percentage.toFixed(0)}`,
      ``,
      `Harcamalarınızı gözden geçirmek isteyebilirsiniz.`,
      ``,
      `MoneyShop uygulamasından detayları görüntüleyebilirsiniz.`,
      ``,
      `İyi günler dileriz,\n${APP_NAME}`,
    ].join("\n"),
  };
}

interface MonthlyReportNotification {
  to: string;
  userName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  currency: string;
  period: string;
}

export function buildMonthlyReportEmail(params: MonthlyReportNotification) {
  return {
    subject: `[${APP_NAME}] Aylık Özet - ${params.period}`,
    text: [
      `Merhaba ${params.userName},`,
      ``,
      `${params.period} dönemi finansal özetiniz:`,
      ``,
      `  Toplam Gelir: +${formatCurrency(params.totalIncome, params.currency)}`,
      `  Toplam Gider: -${formatCurrency(params.totalExpense, params.currency)}`,
      `  Net Durum: ${formatCurrency(params.balance, params.currency)}`,
      ``,
      `Detaylı rapor için MoneyShop uygulamasını ziyaret edin.`,
      ``,
      `İyi günler dileriz,\n${APP_NAME}`,
    ].join("\n"),
  };
}

export function buildTestEmail(userName: string) {
  return {
    subject: `[${APP_NAME}] Test E-postası`,
    text: [
      `Merhaba ${userName},`,
      ``,
      `Bu bir test e-postasıdır.`,
      `E-posta bildirim ayarlarınız başarıyla çalışıyor.`,
      ``,
      `İyi günler dileriz,\n${APP_NAME}`,
    ].join("\n"),
  };
}

// ─── Check if email notifications are enabled ──────────

export async function shouldNotify(
  userId: string,
  event: EmailEvent
): Promise<boolean> {
  try {
    const setting = await prisma.emailNotificationSetting.findUnique({
      where: { userId },
    });
    if (!setting || !setting.enabled) return false;

    const eventMap: Record<EmailEvent, keyof typeof setting> = {
      TRANSACTION: "onTransaction",
      TRANSFER: "onTransfer",
      BUDGET_ALERT: "onBudgetAlert",
      MONTHLY_REPORT: "onMonthlyReport",
      LARGE_TRANSACTION: "onLargeTransaction",
      TEST: "onTransaction", // TEST always uses master toggle
    };

    const field = eventMap[event] as keyof typeof setting;
    return setting[field] === true;
  } catch {
    return false;
  }
}

// ─── Log Sent Email ────────────────────────────────────

export async function logEmail(params: {
  userId: string;
  to: string;
  subject: string;
  body: string;
  event: EmailEvent;
  status?: string;
  error?: string;
}) {
  try {
    await prisma.emailLog.create({
      data: {
        userId: params.userId,
        to: params.to,
        subject: params.subject,
        body: params.body,
        event: params.event,
        status: params.status || "SENT",
        error: params.error,
      },
    });
  } catch (err) {
    console.error("[email] Failed to log:", err);
  }
}

// ─── High-Level Send & Notify ──────────────────────────

export async function sendNotification(
  userId: string,
  event: EmailEvent,
  buildFn: () => { subject: string; text: string } | null
): Promise<boolean> {
  const canSend = await shouldNotify(userId, event);
  if (!canSend) return false;

  const emailContent = buildFn();
  if (!emailContent) return false;

  // Get user's email setting
  const setting = await prisma.emailNotificationSetting.findUnique({
    where: { userId },
  });
  if (!setting || !setting.email) return false;

  const result = await sendEmail({
    to: setting.email,
    subject: emailContent.subject,
    text: emailContent.text,
  });

  await logEmail({
    userId,
    to: setting.email,
    subject: emailContent.subject,
    body: emailContent.text,
    event,
    status: result ? "SENT" : "FAILED",
    error: result ? undefined : "Send returned null",
  });

  return !!result;
}
