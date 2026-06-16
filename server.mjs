// =============================================
// MoneyShop — Production Server (Socket.io + Next.js)
// =============================================
// This replaces the default Next.js standalone server.js
// to add WebSocket (Socket.io) support.
// =============================================

import { createServer } from "http";
import { URL } from "url";
import next from "next/dist/server/next";

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

const app = next({
  dir: ".",
  dev: false,
  hostname: HOSTNAME,
  port: PORT,
  customServer: true,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://${HOSTNAME}:${PORT}`);
    handle(req, res, parsedUrl);
  });

  // ── Socket.io ──────────────────────────────────────
  const { initWebSocketServer } = await import("./src/lib/ws");
  initWebSocketServer(server);

  server.listen(PORT, HOSTNAME, () => {
    console.log(`> Ready on http://${HOSTNAME}:${PORT}`);
    console.log(`> WebSocket path: /api/ws`);
  });
});
