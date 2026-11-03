#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# setup-vps.sh — Run this ON YOUR VPS after transferring files
#
# What it does:
#   1. Installs Docker + Docker Compose (if not present)
#   2. Prompts you to fill in .env
#   3. Builds and starts the app + MongoDB containers
#   4. Seeds the database
#   5. Prints the Coolify proxy instructions
#
# Usage (on VPS):
#   bash /opt/nanosoft/scripts/setup-vps.sh
# ─────────────────────────────────────────────────────────────

set -e

APP_DIR="/opt/nanosoft"
cd "$APP_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Nanosoft — VPS Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Install Docker if missing ──────────────────────────────
if ! command -v docker &>/dev/null; then
  echo "→ Installing Docker..."
  curl -fsSL https://get.docker.com | bash
  systemctl enable docker
  systemctl start docker
  echo "✓ Docker installed"
else
  echo "✓ Docker already installed ($(docker --version))"
fi

# ── 2. Install Docker Compose plugin if missing ───────────────
if ! docker compose version &>/dev/null 2>&1; then
  echo "→ Installing Docker Compose plugin..."
  apt-get update -qq
  apt-get install -y docker-compose-plugin
  echo "✓ Docker Compose installed"
else
  echo "✓ Docker Compose ready ($(docker compose version))"
fi

# ── 3. Set up .env ────────────────────────────────────────────
if [ ! -f "$APP_DIR/.env" ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Configure your environment"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cp "$APP_DIR/.env.example" "$APP_DIR/.env"

  # Generate a secure JWT secret automatically
  JWT_SECRET=$(openssl rand -hex 32)
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" "$APP_DIR/.env"

  echo ""
  echo "A .env file has been created. Please set your admin password now."
  echo ""
  read -rp "  Admin username [admin]: " ADMIN_USER
  ADMIN_USER="${ADMIN_USER:-admin}"

  while true; do
    read -rsp "  Admin password (min 8 chars): " ADMIN_PASS
    echo ""
    if [ ${#ADMIN_PASS} -ge 8 ]; then break; fi
    echo "  Password too short, try again."
  done

  sed -i "s|ADMIN_USERNAME=.*|ADMIN_USERNAME=$ADMIN_USER|" "$APP_DIR/.env"
  sed -i "s|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$ADMIN_PASS|" "$APP_DIR/.env"

  echo ""
  read -rp "  Site URL [https://ntlafrica.com]: " SITE_URL
  SITE_URL="${SITE_URL:-https://ntlafrica.com}"
  sed -i "s|SITE_URL=.*|SITE_URL=$SITE_URL|" "$APP_DIR/.env"

  echo ""
  echo "✓ .env configured (JWT secret auto-generated)"
else
  echo "✓ .env already exists — using existing config"
fi

# ── 4. Build and start containers ────────────────────────────
echo ""
echo "→ Building Docker image (this takes 2–3 minutes first time)..."
docker compose -f "$APP_DIR/docker-compose.yml" build --no-cache

echo ""
echo "→ Starting containers..."
docker compose -f "$APP_DIR/docker-compose.yml" up -d

echo ""
echo "→ Waiting for MongoDB to be ready..."
sleep 10

# ── 5. Seed the database ─────────────────────────────────────
echo "→ Seeding database with Nanosoft content..."
docker compose -f "$APP_DIR/docker-compose.yml" exec -T app node server/seed.js

# ── 6. Verify health ─────────────────────────────────────────
echo ""
echo "→ Checking app health..."
sleep 3

if curl -sf http://localhost:3000/api/health > /dev/null; then
  echo "✓ App is healthy and running on port 3000"
else
  echo "⚠ Health check failed — check logs with:"
  echo "  docker compose -f $APP_DIR/docker-compose.yml logs app"
  exit 1
fi

# ── 7. Print Coolify proxy instructions ──────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Nanosoft is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  App is running at: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "  Now configure Coolify to proxy your domain:"
echo "  ─────────────────────────────────────────────"
echo "  1. Open Coolify → Projects → Nanosoft"
echo "  2. New Resource → Service → Custom HTTP Service"
echo "  3. Set:"
echo "       Domain:  ntlafrica.com"
echo "       Host:    localhost"
echo "       Port:    3000"
echo "  4. Enable Let's Encrypt SSL"
echo "  5. Click Deploy/Save"
echo ""
echo "  Your site will be live at https://ntlafrica.com"
echo ""
echo "  Admin panel: https://ntlafrica.com/admin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
