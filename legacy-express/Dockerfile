# ─────────────────────────────────────────────────────────────
# Nanosoft Technology — Dockerfile
# Multi-stage build: keeps the final image lean (~150MB)
# ─────────────────────────────────────────────────────────────

# ── Stage 1: deps ────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
# Install only production deps (npm install works without package-lock.json)
RUN npm install --omit=dev --ignore-scripts

# ── Stage 2: final image ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root
RUN addgroup -S nanosoft && adduser -S nanosoft -G nanosoft

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy app source (respects .dockerignore)
COPY . .

# Ensure uploads dir exists with correct ownership BEFORE switching user
# (Docker volume mounts copy owner from the image layer on first init)
RUN mkdir -p /app/public/uploads /app/server/ssl

# Generate self-signed SSL cert for LAN HTTPS access (valid 10 years)
RUN apk add --no-cache openssl &&     openssl req -x509 -newkey rsa:2048       -keyout /app/server/ssl/key.pem       -out    /app/server/ssl/cert.pem       -days 3650 -nodes       -subj '/C=KE/ST=Nairobi/O=Nanosoft Technology/CN=ntlafrica.com'

# Set ownership
RUN chown -R nanosoft:nanosoft /app
USER nanosoft

# Coolify / cloud platforms honour PORT env var
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Health check — Coolify uses this to know the app is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server/app.js"]
