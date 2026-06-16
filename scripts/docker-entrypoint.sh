#!/bin/sh
# =============================================
# MoneyShop — Docker Entrypoint
# =============================================
# Runs before the main process:
#   1. Apply pending Prisma migrations (if DATABASE_URL is set)
#   2. Drop privileges to nextjs user
#   3. Execute the CMD (Next.js standalone server)
# =============================================

set -e

echo "[entrypoint] Starting MoneyShop..."

# ── Prisma Migrations ─────────────────────────
if [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Running Prisma db push (schema sync)..."
  npx prisma db push 2>&1 | sed 's/^/[prisma] /'
  echo "[entrypoint] Schema sync complete."
else
  echo "[entrypoint] WARNING: DATABASE_URL not set — skipping migrations."
fi

# ── Drop privileges & start server ────────────
echo "[entrypoint] Switching to nextjs user and starting server..."
exec su-exec nextjs "$@"
