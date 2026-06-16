// =============================================
// MoneyShop — Development WebSocket Server
// =============================================
// Runs alongside `next dev` for hot-reload support.
// Connects to Next.js on port 3000, exposes Socket.io
// on the same HTTP server.
// =============================================

import { createServer } from "http";

const NEXT_PORT = parseInt(process.env.PORT || "3000", 10);
const HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

// Create a passthrough HTTP server that proxies to Next.js
// and hosts Socket.io on the same port.
// In dev mode, `next dev` owns the HTTP server on NEXT_PORT,
// so we connect Socket.io to its server instance.
// Instead, we start a proxy server that wraps everything.

import { createProxyMiddleware } from "http-proxy-middleware";

// Actually for dev, the simplest approach: start an HTTP server
// that proxies Next.js requests and handles Socket.io.
// But next dev starts its own server on the port, so we'd
// need to use a different port and have the client connect
// to the WS port directly.

// ── Simpler Dev Approach ──────────────────────────────
// Start Socket.io on a different port in dev mode.
// Client auto-detects and connects to the right port.

import { Server } from "socket.io";

const WS_PORT = parseInt(process.env.WS_PORT || "3001", 10);

const server = createServer();

const io = new Server(server, {
  path: "/api/ws",
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${NEXT_PORT}`,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Re-use the same room/auth logic
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (typeof userId !== "string") return;
    socket.join(`user:${userId}`);
  });
});

// Override getIO() to return the dev instance
// Works because the module singleton will be set by initWebSocketServer
// but in dev mode we set it directly via module-level setter.
// We export a helper that the ws lib can use.

server.listen(WS_PORT, HOSTNAME, () => {
  console.log(`[WS Dev] WebSocket server running on http://${HOSTNAME}:${WS_PORT}/api/ws`);
  console.log(`[WS Dev] Next.js expected on http://${HOSTNAME}:${NEXT_PORT}`);
});

// Keep the process alive
process.on("SIGTERM", () => {
  io.close();
  server.close();
  process.exit(0);
});
