# ============================================
# MoneyShop — Next.js Production Dockerfile
# ============================================

# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Önce bağımlılıkları kopyala (layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Kaynak kod
COPY . .

# Prisma generate + Build
RUN npx prisma generate
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
