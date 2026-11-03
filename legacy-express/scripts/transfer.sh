#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# transfer.sh — Run this on YOUR LOCAL machine
# Copies the Nanosoft project to your VPS via SCP
#
# Usage:
#   bash scripts/transfer.sh root@YOUR_VPS_IP
#
# Example:
#   bash scripts/transfer.sh root@157.90.124.55
# ─────────────────────────────────────────────────────────────

set -e

TARGET="${1}"

if [ -z "$TARGET" ]; then
  echo "Usage: bash scripts/transfer.sh user@your-vps-ip"
  echo "Example: bash scripts/transfer.sh root@157.90.124.55"
  exit 1
fi

# Project root is one level up from this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Nanosoft — Transfer to VPS"
echo "  Destination: $TARGET:/opt/nanosoft"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create destination directory on VPS
ssh "$TARGET" "mkdir -p /opt/nanosoft"

# Copy files — excludes node_modules, .git, .env
echo "→ Uploading files..."
rsync -avz --progress \
  --exclude='node_modules/' \
  --exclude='.git/' \
  --exclude='.env' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  "$PROJECT_DIR/" \
  "$TARGET:/opt/nanosoft/"

echo ""
echo "✓ Files transferred to $TARGET:/opt/nanosoft"
echo ""
echo "Next steps — SSH into your VPS and run:"
echo "  ssh $TARGET"
echo "  bash /opt/nanosoft/scripts/setup-vps.sh"
echo ""
