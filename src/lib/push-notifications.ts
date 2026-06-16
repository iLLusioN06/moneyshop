// =============================================
// MoneyShop - Web Push Bildirim Servisi
// =============================================

import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// ─── VAPID Keys ──────────────────────────────

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:noreply@moneyshop.iq";

function ensureVapidConfigured() {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error(
      "VAPID anahtarları tanımlanmamış! " +
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY ve VAPID_PRIVATE_KEY ortam değişkenlerini ayarlayın."
    );
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// ─── Event Types ─────────────────────────────

export type PushEvent =
  | "TRANSACTION"
  | "TRANSFER"
  | "BUDGET_ALERT"
  | "MONTHLY_REPORT"
  | "LARGE_TRANSACTION";

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

// ─── Send to Single Subscription ─────────────

async function sendToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    ensureVapidConfigured();

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    const result = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
      { TTL: 86400 } // 24 saat TTL
    );

    return { success: true, statusCode: result.statusCode };
  } catch (err: unknown) {
    if (err instanceof Error) {
      // 410 Gone / 404 Not Found — subscription geçersiz, sil
      if (err.message.includes("410") || err.message.includes("404")) {
        return { success: false, error: "subscription_expired", statusCode: 410 };
      }
      return { success: false, error: err.message };
    }
    return { success: false, error: String(err) };
  }
}

// ─── Send to User ────────────────────────────

export async function sendPushNotification(
  userId: string,
  event: PushEvent,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const canSend = await shouldNotify(userId, event);
  if (!canSend) return { sent: 0, failed: 0 };

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const result = await sendToSubscription(
      { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
      payload
    );

    if (result.success) {
      sent++;
    } else {
      // Subscription süresi dolmuş / geçersiz — temizle
      if (result.error === "subscription_expired") {
        await prisma.pushSubscription
          .delete({ where: { id: sub.id } })
          .catch(() => {});
      }
      failed++;
    }
  }

  return { sent, failed };
}

// ─── Send to All User Subscriptions ──────────

export async function sendPushToAllSubscriptions(
  payload: PushPayload
): Promise<number> {
  const subscriptions = await prisma.pushSubscription.findMany();
  let sent = 0;

  for (const sub of subscriptions) {
    const result = await sendToSubscription(
      { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
      payload
    );

    if (result.success) {
      sent++;
    } else if (result.error === "subscription_expired") {
      await prisma.pushSubscription
        .delete({ where: { id: sub.id } })
        .catch(() => {});
    }
  }

  return sent;
}

// ─── Check if push notifications are enabled ─

export async function shouldNotify(
  userId: string,
  event: PushEvent
): Promise<boolean> {
  try {
    const setting = await prisma.pushNotificationSetting.findUnique({
      where: { userId },
    });
    if (!setting || !setting.enabled) return false;

    const eventMap: Record<PushEvent, keyof typeof setting> = {
      TRANSACTION: "onTransaction",
      TRANSFER: "onTransfer",
      BUDGET_ALERT: "onBudgetAlert",
      MONTHLY_REPORT: "onMonthlyReport",
      LARGE_TRANSACTION: "onLargeTransaction",
    };

    const field = eventMap[event] as keyof typeof setting;
    return setting[field] === true;
  } catch {
    return false;
  }
}

// ─── Helper: Build Notification Payloads ─────

export function buildTransactionPushPayload(params: {
  userName: string;
  type: string;
  amount: number;
  currency: string;
  description?: string | null;
  accountName: string;
}): PushPayload {
  const typeLabel =
    params.type === "INCOME"
      ? "Gelir"
      : params.type === "EXPENSE"
        ? "Gider"
        : "Transfer";
  const sign = params.type === "INCOME" ? "+" : "";

  return {
    title: `Yeni ${typeLabel} İşlemi`,
    body: `${params.accountName} - ${sign}${formatCurrency(params.amount, params.currency)}${params.description ? ` — ${params.description}` : ""}`,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    url: "/dashboard/transactions",
    tag: `transaction-${Date.now()}`,
    data: { type: "transaction", eventType: params.type },
  };
}

export function buildTransferPushPayload(params: {
  userName: string;
  amount: number;
  currency: string;
  recipientName?: string | null;
}): PushPayload {
  return {
    title: `Para Transferi`,
    body: `Hesabınızdan ${formatCurrency(params.amount, params.currency)} transfer edildi${params.recipientName ? ` — ${params.recipientName}` : ""}`,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    url: "/dashboard/transfers",
    tag: `transfer-${Date.now()}`,
    data: { type: "transfer" },
  };
}

export function buildBudgetAlertPushPayload(params: {
  categoryName: string;
  budgetAmount: number;
  spent: number;
  percentage: number;
}): PushPayload {
  return {
    title: `⚠️ Bütçe Uyarısı: ${params.categoryName}`,
    body: `Bütçenizin %${params.percentage.toFixed(0)}'i kullanıldı (${formatCurrency(params.spent)} / ${formatCurrency(params.budgetAmount)})`,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    url: "/dashboard/budgets",
    tag: `budget-${params.categoryName}`,
    data: { type: "budget_alert" },
  };
}

export function buildMonthlyReportPushPayload(params: {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  currency: string;
  period: string;
}): PushPayload {
  return {
    title: `Aylık Özet — ${params.period}`,
    body: `Gelir: +${formatCurrency(params.totalIncome, params.currency)} | Gider: -${formatCurrency(params.totalExpense, params.currency)} | Net: ${formatCurrency(params.balance, params.currency)}`,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    url: "/dashboard/reports",
    tag: `monthly-report-${params.period}`,
    data: { type: "monthly_report" },
  };
}

// ─── Helpers ─────────────────────────────────

function formatCurrency(amount: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
