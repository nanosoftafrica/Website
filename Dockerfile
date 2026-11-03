# Nanosoft Technologies Limited website (Next.js 16) - production image.
# Build:  docker compose build      Run:  docker compose up -d
# On start it applies database migrations and the starter data, then serves
# the site on port 3000. Uploads, image descriptions and backups live in
# volumes (see docker-compose.yml), so rebuilding the image never loses them.

ARG NODE_VERSION=24

# 1. All dependencies, used only to build
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Production-only dependencies (needed at runtime by migrations and seed)
FROM node:${NODE_VERSION}-bookworm-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 3. Build the site. "npm run build" would also migrate and seed, which needs
#    a database, so the image calls next build directly.
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=
ARG NEXT_PUBLIC_GTM_ID=
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID \
    NEXT_PUBLIC_GTM_ID=$NEXT_PUBLIC_GTM_ID
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx next build

# 4. Final image
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# pg_dump/pg_restore 17 for the backups (Debian bookworm only ships 15,
# which can't dump a PostgreSQL 17 server), from the PostgreSQL apt repo.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && install -d /usr/share/postgresql-common/pgdg \
 && curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc \
 && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends postgresql-client-17 \
 && apt-get purge -y curl && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
# Standalone server, then its static files and the public folder
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Migrations, models and starter data used at start-up
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/scripts ./scripts
# Backup code used by the server and by scripts/backup.js
COPY --from=build --chown=node:node /app/lib/backup.js /app/lib/backupScheduler.js ./lib/
COPY --from=build --chown=node:node /app/package.json ./package.json

RUN mkdir -p public/uploads data backups && chown -R node:node public/uploads data backups
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "node scripts/run-migration.js && node server/seed.js && exec node server.js"]