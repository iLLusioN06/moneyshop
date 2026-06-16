# ============================================
# MoneyShop — Next.js Production Dockerfile
# ============================================

# ============================================
# MoneyShop — Multi-stage Dockerfile
# ============================================
# Target: runner (default) → Next.js standalone
# Target: ws-server    → Standalone Socket.io
# ============================================

# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# ---- Next.js Runner (target: runner) ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# su-exec: switch user from root in entrypoint
RUN apk add --no-cache su-exec

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]

# ---- WebSocket Server (target: ws-server) ----
FROM node:20-alpine AS ws-server

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY scripts/ws-server.js ./scripts/ws-server.js

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "scripts/ws-server.js"]
