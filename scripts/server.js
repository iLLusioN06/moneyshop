// =============================================
// MoneyShop — Production Server (Socket.io + Next.js)
// =============================================
// Designed to replace .next/standalone/server.js
// Adds WebSocket (Socket.io) support alongside Next.js.
// =============================================

const { createServer } = require("http");
const { URL } = require("url");

// ------ Next.js (standalone) ------
// In standalone mode, the Next.js server factory is at this path.
// This is the same import pattern as the default standalone server.js.
const next = require("next/dist/server/next");

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

app.prepare().then(async () => {
  const server = createServer((req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://${HOSTNAME}:${PORT}`);
    handle(req, res, parsedUrl);
  });

  // ------ Socket.io ------
  const { initWebSocketServer } = require("./src/lib/ws");
  initWebSocketServer(server);

  server.listen(PORT, HOSTNAME, () => {
    console.log(`> Ready on http://${HOSTNAME}:${PORT}`);
    console.log(`> WebSocket path: /api/ws`);
  });
});
