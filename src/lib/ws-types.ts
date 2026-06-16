// =============================================
// MoneyShop — WebSocket Event Types & Constants
// =============================================
// Client-side ve server-side tarafından ortak
// kullanılır. ioredis import etmez — bundle
// hatasını önler.
// =============================================

export const WS_EVENTS = {
  TRANSACTION: "transaction",
  BALANCE_UPDATE: "balance:update",
  TRANSFER: "transfer",
  NOTIFICATION: "notification",
} as const;

export interface WsTransactionPayload {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  currency: string;
  description: string | null;
  accountName: string;
  date: string;
  status: string;
}

export interface WsBalancePayload {
  accountId: string;
  accountName: string;
  newBalance: number;
  currency: string;
  change: number;
}

export interface WsNotificationPayload {
  id: string;
  title: string;
  body: string;
  variant: "success" | "warning" | "error" | "info";
  url?: string;
  timestamp: number;
}
