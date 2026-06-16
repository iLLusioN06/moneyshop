// =============================================
// MoneyShop — WebSocket Sağlayıcı
// =============================================
// - WebSocket bağlantısını yönetir
// - Gelen event'leri toast bildirimine çevirir
// - Dashboard/Transactions bileşenlerine
//   veri güncelleme sinyali gönderir
// =============================================

"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import type {
  WsTransactionPayload,
  WsBalancePayload,
  WsNotificationPayload,
} from "@/lib/ws-types";
import { cn } from "@/lib/utils";

// ─── Context ──────────────────────────────────────────

interface WebSocketContextValue {
  connected: boolean;
  /** Son gelen transaction event'i (bileşenler refetch için kullanır) */
  lastTransaction: WsTransactionPayload | null;
  /** Son gelen balance event'i */
  lastBalance: WsBalancePayload | null;
  /** Her yeni event'te artan sayaç — bileşenler refetch kararı için kullanır */
  eventVersion: number;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  connected: false,
  lastTransaction: null,
  lastBalance: null,
  eventVersion: 0,
});

export const useWebSocketContext = () => useContext(WebSocketContext);

// ─── Toast Types ──────────────────────────────────────

interface Toast {
  id: string;
  title: string;
  message: string;
  variant: "success" | "warning" | "error" | "info";
  url?: string;
}

let toastCounter = 0;

// ─── Provider ─────────────────────────────────────────

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [lastTransaction, setLastTransaction] = useState<WsTransactionPayload | null>(null);
  const [lastBalance, setLastBalance] = useState<WsBalancePayload | null>(null);
  const [eventVersion, setEventVersion] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${++toastCounter}`;
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => [...prev, newToast].slice(-5));

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  // ─── WebSocket Event Handlers ──────────────────────

  const onTransaction = useCallback((payload: WsTransactionPayload) => {
    setLastTransaction(payload);
    setEventVersion((v) => v + 1);
  }, []);

  const onBalanceUpdate = useCallback((payload: WsBalancePayload) => {
    setLastBalance(payload);
    setEventVersion((v) => v + 1);
  }, []);

  const onNotification = useCallback(
    (payload: WsNotificationPayload) => {
      addToast({
        title: payload.title,
        message: payload.body,
        variant: payload.variant,
        url: payload.url,
      });
    },
    [addToast]
  );

  const { connected } = useWebSocket({
    onTransaction,
    onBalanceUpdate,
    onNotification,
  });

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        lastTransaction,
        lastBalance,
        eventVersion,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </WebSocketContext.Provider>
  );
}

// ─── Toast Container ──────────────────────────────────

function ToastContainer({
  toasts,
  setToasts,
}: {
  toasts: Toast[];
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm pointer-events-auto",
            "bg-surface/95 border-border",
            "animate-[slide-up_0.3s_ease-out]",
            variantBorder(toast.variant)
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {toast.title}
            </p>
            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-surface-tertiary transition-colors"
          >
            <svg
              className="w-3 h-3 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────

function variantBorder(variant: string): string {
  switch (variant) {
    case "success":
      return "border-l-4 border-l-profit";
    case "error":
      return "border-l-4 border-l-loss";
    case "warning":
      return "border-l-4 border-l-warning";
    default:
      return "border-l-4 border-l-secondary";
  }
}
