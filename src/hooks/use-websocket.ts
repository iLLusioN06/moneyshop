// =============================================
// MoneyShop — WebSocket Hook (Gelişmiş)
// =============================================
// Socket.io istemcisini yönetir:
// - Exponential backoff ile otomatik yeniden bağlanma
// - Connection state tracking
// - Manuel yeniden bağlanma
// - Heartbeat/ping
// - Event'lere abone olma
// - Bileşen unmount olunca temizlik
// =============================================

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1_000,
  reconnectionDelayMax: 30_000,
  timeout: 10_000,
};

// Heartbeat interval (ms)
const HEARTBEAT_INTERVAL = 25_000;
const HEARTBEAT_TIMEOUT = 10_000;

// ─── Connection State ──────────────────────────────────

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

// ─── Event Handler Types ──────────────────────────────

export type TransactionHandler = (payload: WsTransactionPayload) => void;
export type BalanceHandler = (payload: WsBalancePayload) => void;
export type NotificationHandler = (payload: WsNotificationPayload) => void;

export interface UseWebSocketOptions {
  onTransaction?: TransactionHandler;
  onBalanceUpdate?: BalanceHandler;
  onNotification?: NotificationHandler;
  onConnectionChange?: (connected: boolean) => void;
  onStateChange?: (state: ConnectionState) => void;
  /** Otomatik bağlanmayı devre dışı bırak */
  autoConnect?: boolean;
}

// ─── Hook ─────────────────────────────────────────────

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);

  const [state, setState] = useState<ConnectionState>("disconnected");
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  // Her render'da en güncel options'a eriş
  useEffect(() => {
    optionsRef.current = options;
  });

  // ─── Heartbeat ──────────────────────────────────────

  const startHeartbeat = useCallback((socket: Socket) => {
    stopHeartbeat();
    heartbeatRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping");
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  // ─── State Değişikliği ──────────────────────────────

  const updateState = useCallback(
    (newState: ConnectionState) => {
      setState(newState);
      optionsRef.current.onStateChange?.(newState);
      optionsRef.current.onConnectionChange?.(newState === "connected");
    },
    []
  );

  // ─── Manuel Yeniden Bağlanma ────────────────────────

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    updateState("connecting");
    connect();
  }, [updateState]);

  // ─── Bağlantı Kurulumu ─────────────────────────────

  const connect = useCallback(() => {
    const socket = io(WS_URL, WS_OPTIONS);
    socketRef.current = socket;
    setTimeout(() => setSocketInstance(socket), 0);

    // Bağlantı olayları
    socket.on("connect", () => {
      updateState("connected");
      setReconnectAttempt(0);
      startHeartbeat(socket);

      // Kullanıcı odasına katıl
      if (session?.user?.id) {
        socket.emit("join", session.user.id);
      }
    });

    socket.on("disconnect", (reason) => {
      stopHeartbeat();
      updateState("disconnected");

      // Manuel disconnect değilse yeniden bağlan
      if (reason !== "io client disconnect") {
        updateState("reconnecting");
      }
    });

    socket.on("reconnect_attempt", (attempt) => {
      setReconnectAttempt(attempt);
      updateState("reconnecting");
    });

    socket.on("reconnect", () => {
      updateState("connected");
      setReconnectAttempt(0);
      startHeartbeat(socket);

      if (session?.user?.id) {
        socket.emit("join", session.user.id);
      }
    });

    socket.on("reconnect_failed", () => {
      updateState("disconnected");
      console.error("[WS] Tüm yeniden bağlanma denemeleri başarısız");
    });

    socket.on("connect_error", (err) => {
      console.warn("[WS] Connection error:", err.message);
    });

    socket.on("pong", () => {
      // Heartbeat yanıtı alındı
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
  }, [session?.user?.id, updateState, startHeartbeat, stopHeartbeat]);

  // ─── Connect/Disconnect ─────────────────────────────

  useEffect(() => {
    if (options.autoConnect === false) return;

    updateState("connecting");
    connect();

    return () => {
      stopHeartbeat();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketInstance(null);
      updateState("disconnected");
    };
  }, [session?.user?.id, options.autoConnect, connect, updateState, stopHeartbeat]);

  // ─── Oda Katılma (session değişirse) ──────────────

  useEffect(() => {
    if (!socketRef.current || state !== "connected" || !session?.user?.id) return;
    socketRef.current.emit("join", session.user.id);
  }, [session?.user?.id, state]);

  // ─── Visibility Change — Sekme arka plana geçince yeniden bağlan ─

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return {
    /** Bağlantı durumu */
    state,
    /** Bağlı mı (eskisiyle uyumluluk) */
    connected: state === "connected",
    /** Socket instance */
    socket: socketInstance,
    /** Kaçıncı yeniden deneme */
    reconnectAttempt,
    /** Manuel yeniden bağlanma */
    reconnect,
  };
}
