#!/bin/bash
# =============================================
# MoneyShop — Production Deployment Script
# =============================================
# Usage:
#   1. Copy files to VPS:
#      rsync -avz --include='docker-compose.yml' --include='Dockerfile' \
#            --include='.dockerignore' --include='scripts/' --include='.env' \
#            --exclude='*' ./ user@vps:/opt/moneyshop/
#
#   2. SSH into VPS and run:
#      cd /opt/moneyshop
#      chmod +x scripts/deploy.sh
#      ./scripts/deploy.sh
# =============================================

set -euo pipefail

echo "========================================"
echo "  MoneyShop — Production Deployment"
echo "========================================"

# ── Check prerequisites ───────────────────────
if ! command -v docker &> /dev/null; then
  echo "ERROR: Docker is not installed."
  echo "Install it first: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo "ERROR: Docker Compose is not installed."
  exit 1
fi

# ── Check .env ────────────────────────────────
if [ ! -f .env ]; then
  echo "ERROR: .env file not found!"
  echo "Copy .env.example to .env and fill in the values."
  exit 1
fi

# ── Pull latest images (build cache) ──────────
echo ">>> Pulling base images..."
docker pull node:20-alpine
docker pull redis:7-alpine

# ── Build images ──────────────────────────────
echo ">>> Building Docker images..."
docker compose build --no-cache

# ── Sync database schema ──────────────────────
echo ">>> Syncing database schema..."
docker compose run --rm app npx prisma db push

# ── Start services ────────────────────────────
echo ">>> Starting services..."
docker compose up -d

# ── Cleanup old images ────────────────────────
echo ">>> Cleaning up..."
docker image prune -f

# ── Verify ────────────────────────────────────
echo ">>> Verifying deployment..."
sleep 5
if docker compose ps --status running | grep -q "moneyshop-app"; then
  echo "SUCCESS: MoneyShop is running!"
  echo ""
  echo "  App:  http://$(curl -s ifconfig.me):3000"
  echo "  WS:   http://$(curl -s ifconfig.me):3001"
  echo ""
  echo "  Logs: docker compose logs -f"
else
  echo "WARNING: App container is not running."
  echo "Check logs: docker compose logs"
fi
