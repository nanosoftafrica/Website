# ─────────────────────────────────────────────────────────────
# transfer.ps1 — Windows PowerShell version of transfer.sh
# Run this on YOUR LOCAL Windows machine
#
# Usage (in PowerShell):
#   .\scripts\transfer.ps1 -Target root@YOUR_VPS_IP
#
# Example:
#   .\scripts\transfer.ps1 -Target root@157.90.124.55
#
# Requires: OpenSSH (built into Windows 10/11)
# ─────────────────────────────────────────────────────────────

param(
    [Parameter(Mandatory=$true)]
    [string]$Target
)

$ProjectDir = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Nanosoft — Transfer to VPS" -ForegroundColor Cyan
Write-Host "  Destination: $Target`:/opt/nanosoft" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Create destination on VPS
Write-Host "→ Creating /opt/nanosoft on VPS..." -ForegroundColor Yellow
ssh $Target "mkdir -p /opt/nanosoft"

# Files to transfer (rsync not always available on Windows, use scp)
# We'll use scp with exclusions via a temp copy

$TempDir = "$env:TEMP\nanosoft-deploy"
if (Test-Path $TempDir) { Remove-Item -Recurse -Force $TempDir }

Write-Host "→ Preparing files (excluding node_modules, .git, .env)..." -ForegroundColor Yellow
Copy-Item -Recurse $ProjectDir $TempDir

# Remove exclusions from temp copy
$excludes = @('node_modules', '.git', '.env', '*.log')
foreach ($ex in $excludes) {
    Get-ChildItem -Path $TempDir -Filter $ex -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "→ Uploading files via SCP..." -ForegroundColor Yellow
scp -r "$TempDir\*" "${Target}:/opt/nanosoft/"

# Cleanup temp
Remove-Item -Recurse -Force $TempDir

Write-Host ""
Write-Host "✓ Files transferred to ${Target}:/opt/nanosoft" -ForegroundColor Green
Write-Host ""
Write-Host "Next: SSH into your VPS and run:" -ForegroundColor Cyan
Write-Host "  ssh $Target" -ForegroundColor White
Write-Host "  bash /opt/nanosoft/scripts/setup-vps.sh" -ForegroundColor White
Write-Host ""
