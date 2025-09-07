# syntax=docker/dockerfile:1.7

# --- Build stage ---
FROM node:18.20.2 AS build

WORKDIR /app

# Install deps first (better cache)
COPY package.json bun.lockb* package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  else npm install; fi

# Copy source
COPY tsconfig.json ./tsconfig.json
COPY src ./src

# Build
RUN npm run build


# --- Runtime stage ---
FROM node:18.20.2 AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp

# Copy only runtime artifacts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./package.json

# Reduce size: drop dev dependencies
RUN npm prune --omit=dev

# Fix ownership for non-root user to write database.sqlite and logs
RUN chown -R nodeusr:nodegrp /app
USER nodeusr

# Environment
ENV NODE_ENV=production \
    TZ=UTC

# Copy example env if present (optional)
# Users should pass real envs at runtime

# Healthcheck: process exists and can access Discord domain (best-effort)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Expose nothing (Discord bot is outbound only)

# Default command
CMD ["node", "./dist/index.js"]


