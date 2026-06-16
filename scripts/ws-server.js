// =============================================
// MoneyShop — Standalone WebSocket Server
// =============================================
// Ayrı bir süreçte çalışır. Next.js'ten bağımsızdır.
// Redis Pub/Sub ile API route'larından event alır
// ve bağlı Socket.io istemcilerine iletir.
// =============================================
// Kullanım:
//   node scripts/ws-server.js
//   # veya Docker'da PM2 / süpervizör ile
// =============================================

const http = require("http");
const { Server } = require("socket.io");

const PORT = parseInt(process.env.WS_PORT || "3001", 10);
const HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
const CORS_ORIGIN =
  process.env.CORS_ORIGIN ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";
const REDIS_URL = process.env.REDISTOGO_URL || process.env.REDIS_URL;

// ─── HTTP Sunucu + Socket.io ─────────────────────────

const server = http.createServer();

const io = new Server(server, {
  path: "/api/ws",
  cors: {
    origin: CORS_ORIGIN.split(",").map((s) => s.trim()),
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 25_000,
  pingTimeout: 20_000,
  transports: ["websocket", "polling"],
});

// ─── Redis Pub/Sub (opsiyonel) ────────────────────────

if (REDIS_URL) {
  let redisSubscriber;

  try {
    const Redis = require("ioredis");

    redisSubscriber = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 3000),
    });

    redisSubscriber.subscribe("moneyshop:ws:events", (err, count) => {
      if (err) {
        console.error("[WS] Redis subscribe failed:", err.message);
        return;
      }
      console.log(`[WS] Redis subscribed (${count} channels)`);
    });

    redisSubscriber.on("message", (channel, message) => {
      try {
        const { userId, event, data } = JSON.parse(message);
        if (userId && event) {
          io.to(`user:${userId}`).emit(event, data);
        }
      } catch (err) {
        console.error("[WS] Invalid Redis message:", err.message);
      }
    });

    redisSubscriber.on("error", (err) => {
      if (err.code !== "ECONNREFUSED") {
        console.error("[WS] Redis error:", err.message);
      }
    });

    redisSubscriber.on("end", () => {
      console.warn("[WS] Redis connection closed");
    });
  } catch (err) {
    console.warn("[WS] Redis not available, running in-memory only:", err.message);
  }
} else {
  console.log("[WS] No REDIS_URL, running in-memory only");
}

// ─── Socket.io Bağlantıları ──────────────────────────

io.on("connection", (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  socket.on("join", (userId) => {
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

// ─── Sunucuyu Başlat ─────────────────────────────────

server.listen(PORT, HOSTNAME, () => {
  console.log(`[WS] WebSocket server ready → http://${HOSTNAME}:${PORT}/api/ws`);
  console.log(`[WS] CORS origin: ${CORS_ORIGIN}`);
  console.log(`[WS] Redis: ${REDIS_URL ? "connected" : "not configured"}`);
});

// ─── Graceful Shutdown ───────────────────────────────

const shutdown = () => {
  console.log("\n[WS] Shutting down...");
  io.close();
  server.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
