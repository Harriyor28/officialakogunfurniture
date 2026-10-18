# syntax=docker/dockerfile:1
#
# Production image for Official Akogun Furniture (Next.js 16 + Prisma 7 + SQLite).
#
#   docker build -t akogun-furniture .
#   docker run --rm -p 3000:3000 \
#     -e DATABASE_URL=file:/data/akogun.db \
#     -e SESSION_SECRET="$(openssl rand -hex 32)" \
#     -e SITE_URL=https://example.com \
#     -v akogun-data:/data \
#     akogun-furniture
#
# The container keeps the database and uploaded media under /data, so mount a
# persistent volume there (see docker-compose.yml and the README).

# --- Base image with the toolchain required to build better-sqlite3 ----------
FROM node:22-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# --- Dependencies (cached until package.json / package-lock.json change) -----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Build the Next.js application ------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Optional: NEXT_PUBLIC_* values are inlined at build time. The server-side
# code prefers the runtime SITE_URL variable, so this is only a fallback.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}
RUN npx prisma generate && npm run build

# --- Runtime image (no build toolchain) -------------------------------------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

# Application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib/generated ./lib/generated
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p /data /app/data

EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "exec npx next start -H 0.0.0.0 -p \"${PORT:-3000}\""]
