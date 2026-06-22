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

export interface Attachment {
  filename: string;
  content: string; // Base64-encoded
}

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Attachment[];
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail({ to, subject, text, html, attachments }: SendEmailParams): Promise<SendEmailResult | null> {
  const client = getResend();
  if (!client) {
    console.warn("[email] RESEND_API_KEY tanımlı değil, e-posta gönderilemedi.");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const result = await client.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>"),
      attachments,
    });
    if (result?.error) {
      return { success: false, error: String(result.error) };
    }
    return { success: true, id: result?.data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Send failed:", message);
    return { success: false, error: message };
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

interface PasswordResetNotification {
  to: string;
  userName: string;
  resetLink: string;
}

export function buildPasswordResetEmail(params: PasswordResetNotification) {
  return {
    subject: `[${APP_NAME}] Parola Sıfırlama Talebi`,
    text: [
      `Merhaba ${params.userName},`,
      ``,
      `Hesabınız için parola sıfırlama talebi aldık.`,
      ``,
      `Parolanızı sıfırlamak için aşağıdaki bağlantıya tıklayın:`,
      ``,
      `${params.resetLink}`,
      ``,
      `Bu bağlantı 1 saat süreyle geçerlidir.`,
      ``,
      `Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayın.`,
      ``,
      `İyi günler dileriz,\n${APP_NAME}`,
    ].join("\n"),
    html: [
      `<!DOCTYPE html>`,
      `<html><body style="font-family:Arial,sans-serif;padding:20px;background:#f4f4f4;">`,
      `<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">`,
      `<div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);margin:-32px -32px 24px;padding:24px;border-radius:12px 12px 0 0;text-align:center;">`,
      `<h1 style="color:#fff;margin:0;font-size:20px;">${APP_NAME}</h1>`,
      `</div>`,
      `<h2 style="color:#1e293b;font-size:18px;">Parola Sıfırlama</h2>`,
      `<p style="color:#64748b;line-height:1.6;">Merhaba <strong>${params.userName}</strong>,</p>`,
      `<p style="color:#64748b;line-height:1.6;">Hesabınız için parola sıfırlama talebi aldık.</p>`,
      `<p style="color:#64748b;line-height:1.6;">Parolanızı sıfırlamak için aşağıdaki butona tıklayın:</p>`,
      `<div style="text-align:center;margin:28px 0;">`,
      `<a href="${params.resetLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:15px;">Parolamı Sıfırla</a>`,
      `</div>`,
      `<p style="color:#94a3b8;font-size:13px;line-height:1.5;">Bu bağlantı <strong>1 saat</strong> süreyle geçerlidir. Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayın.</p>`,
      `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`,
      `<p style="color:#94a3b8;font-size:12px;text-align:center;">${APP_NAME} — Modern Finansal Yönetim Paneli</p>`,
      `</div></body></html>`,
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
    status: result?.success ? "SENT" : "FAILED",
    error: result?.success ? undefined : (result?.error ?? "E-posta gönderilemedi (null)"),
  });

  return result?.success ?? false;
}
