// =============================================
// MoneyShop — WebSocket Hook
// =============================================
// Socket.io istemcisini yönetir:
// - Bağlantı kurulumu / otomatik yeniden bağlanma
// - Kullanıcı odasına katılma
// - Event'lere abone olma
// - Bileşen unmount olunca temizlik
// =============================================

"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

import type {
  WsTransactionPayload,
  WsBalancePayload,
  WsNotificationPayload,
} from "@/lib/ws-types";
import { WS_EVENTS } from "@/lib/ws-types";

// ─── Config ───────────────────────────────────────────

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001");

const WS_OPTIONS = {
  path: "/api/ws",
  transports: ["websocket", "polling"] as Array<"websocket" | "polling">,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1_000,
  reconnectionDelayMax: 10_000,
};

// ─── Event Handler Types ──────────────────────────────

export type TransactionHandler = (payload: WsTransactionPayload) => void;
export type BalanceHandler = (payload: WsBalancePayload) => void;
export type NotificationHandler = (payload: WsNotificationPayload) => void;

export interface UseWebSocketOptions {
  /** Yeni işlem event'i geldiğinde */
  onTransaction?: TransactionHandler;
  /** Bakiye güncellendiğinde */
  onBalanceUpdate?: BalanceHandler;
  /** Bildirim geldiğinde (toast) */
  onNotification?: NotificationHandler;
  /** Bağlantı durumu değiştiğinde */
  onConnectionChange?: (connected: boolean) => void;
}

// ─── Hook ─────────────────────────────────────────────

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const optionsRef = useRef(options);

  // Her render'da en güncel options'a eriş
  useEffect(() => {
    optionsRef.current = options;
  });

  // ─── Bağlantı Kurulumu ─────────────────────────────

  useEffect(() => {
    const socket = io(WS_URL, WS_OPTIONS);
    socketRef.current = socket;
    setTimeout(() => {
      setSocketInstance(socket);
    }, 0);

    socket.on("connect", () => {
      setConnected(true);
      optionsRef.current.onConnectionChange?.(true);

      // Kullanıcı oturumu varsa odasına katıl
      if (session?.user?.id) {
        socket.emit("join", session.user.id);
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
      optionsRef.current.onConnectionChange?.(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("[WS] Connection error:", err.message);
    });

    // ─── Event Listener'lar ──────────────────────────

    socket.on(WS_EVENTS.TRANSACTION, (payload: WsTransactionPayload) => {
      optionsRef.current.onTransaction?.(payload);
    });

    socket.on(WS_EVENTS.BALANCE_UPDATE, (payload: WsBalancePayload) => {
      optionsRef.current.onBalanceUpdate?.(payload);
    });

    socket.on(WS_EVENTS.NOTIFICATION, (payload: WsNotificationPayload) => {
      optionsRef.current.onNotification?.(payload);
    });

    // ─── Temizlik ────────────────────────────────────

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketInstance(null);
    };
  }, [session?.user?.id]);

  // ─── Oda Katılma (session değişirse) ──────────────

  useEffect(() => {
    if (!socketRef.current || !connected || !session?.user?.id) return;
    socketRef.current.emit("join", session.user.id);
  }, [session?.user?.id, connected]);

  return {
    connected,
    socket: socketInstance,
  };
}
