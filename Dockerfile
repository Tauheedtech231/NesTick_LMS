# ---------- Stage 1: Dependencies ----------
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

# ---------- Stage 2: Build ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time Environment Variables
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build Application
RUN npm run build

# ---------- Stage 3: Production ----------
FROM node:22-alpine AS runner

WORKDIR /app

# Production Environment
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Create Non-Root User
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy Standalone Build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Run as Non-Root User
USER nextjs

# Expose Application Port
EXPOSE 3000

# Health Check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --spider --no-verbose http://127.0.0.1:3000/api/health || exit 1

# Start Next.js Standalone Server
CMD ["node", "server.js"]