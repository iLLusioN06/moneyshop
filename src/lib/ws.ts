// =============================================
// MoneyShop - WebSocket Event Yayıncısı
// =============================================
// - In-process: initWebSocketServer() ile aynı süreçte Socket.io
// - Redis Pub/Sub: ayrı süreçteki WS sunucusuna event iletme
// - Emit helper'ları: önce Redis'i dener, yoksa in-process'e düşer
//
// NOT: Client-side bundle'lar ws-types.ts'den import etmelidir.
// =============================================

import type { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Redis } from "ioredis";
import {
  WS_EVENTS,
  type WsTransactionPayload,
  type WsBalancePayload,
  type WsNotificationPayload,
} from "./ws-types";
export { WS_EVENTS } from "./ws-types";
export type {
  WsTransactionPayload,
  WsBalancePayload,
  WsNotificationPayload,
} from "./ws-types";

// ─── In-process singleton ─────────────────────────────

let io: SocketIOServer | null = null;

// ─── Redis Pub/Sub ────────────────────────────────────

const REDIS_URL = process.env.REDISTOGO_URL || process.env.REDIS_URL;
const WS_CHANNEL = "moneyshop:ws:events";

let redisPublisher: Redis | null = null;

function getRedisPublisher(): Redis | null {
  if (!REDIS_URL) return null;
  if (redisPublisher) return redisPublisher;

  try {
    redisPublisher = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redisPublisher.connect().catch(() => {
      redisPublisher = null;
    });
  } catch {
    return null;
  }
  return redisPublisher;
}

// ─── Initialize Socket.io Server (in-process) ────────

export function initWebSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: "/api/ws",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 25_000,
    pingTimeout: 20_000,
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    socket.on("join", (userId: string) => {
      if (!userId || typeof userId !== "string") return;
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[WS] Client disconnected: ${socket.id} (${reason})`);
    });

    socket.on("error", (err) => {
      console.error(`[WS] Socket error ${socket.id}:`, err.message);
    });
  });

  return io;
}

// ─── Get IO Instance ─────────────────────────────────

export function getIO(): SocketIOServer | null {
  return io;
}

// ─── Emit Helpers ────────────────────────────────────

/**
 * Bir kullanıcıya gerçek zamanlı event gönderir.
 * - Redis varsa → Redis Pub/Sub ile WS sunucusuna iletir
 * - Redis yoksa → in-process Socket.io'yu dener
 */
export function emitToUser(userId: string, event: string, data: unknown): void {
  // Önce Redis dene
  const pub = getRedisPublisher();
  if (pub) {
    const message = JSON.stringify({ userId, event, data, timestamp: Date.now() });
    pub.publish(WS_CHANNEL, message).catch(() => {
      /* ignore */
    });
    return;
  }

  // Redis yok → in-process Socket.io
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function emitTransactionEvent(
  userId: string,
  payload: WsTransactionPayload
): void {
  emitToUser(userId, WS_EVENTS.TRANSACTION, payload);
}

export function emitBalanceEvent(
  userId: string,
  payload: WsBalancePayload
): void {
  emitToUser(userId, WS_EVENTS.BALANCE_UPDATE, payload);
}

export function emitNotification(
  userId: string,
  payload: WsNotificationPayload
): void {
  emitToUser(userId, WS_EVENTS.NOTIFICATION, payload);
}
