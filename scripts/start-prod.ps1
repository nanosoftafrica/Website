# Starts the production copy of the Nanosoft website on port 3001 (if it
# isn't already running), then opens the main pages once so the first real
# visitor doesn't wait. Run at boot by the "Nanosoft Website (port 3001)"
# scheduled task; safe to run by hand too.
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$log  = Join-Path (Split-Path -Parent $root) 'nanosoft-prod-3001.log'
$warmLog = Join-Path (Split-Path -Parent $root) 'nanosoft-warmup.log'
$npx  = Join-Path $env:ProgramFiles 'nodejs\npx.cmd'
Set-Location $root

function Listening { [bool](Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) }

$proc = $null
if (-not (Listening)) {
  Add-Content $warmLog "`r`n=== $(Get-Date -Format s) start-prod.ps1 starting next on 3001"
  $cmd = "set NEXT_DIST_DIR=.next-prod&& `"$npx`" next start -p 3001 -H 0.0.0.0 >> `"$log`" 2>&1"
  $proc = Start-Process -FilePath $env:ComSpec -ArgumentList '/c', $cmd -WorkingDirectory $root -WindowStyle Hidden -PassThru
}

for ($i = 0; $i -lt 90 -and -not (Listening); $i++) { Start-Sleep -Seconds 2 }

# Warm the main pages, then every product and blog page linked from them.
$base = 'http://localhost:3001'
$paths = [System.Collections.Generic.List[string]]::new()
foreach ($p in '/', '/products', '/blog', '/case-studies', '/team', '/about') { $paths.Add($p) }
foreach ($list in '/products', '/blog') {
  try {
    $html = (Invoke-WebRequest "$base$list" -UseBasicParsing -TimeoutSec 90).Content
    foreach ($m in [regex]::Matches($html, 'href="(/(?:products|blog)/[a-z0-9\-]+)"')) {
      if (-not $paths.Contains($m.Groups[1].Value)) { $paths.Add($m.Groups[1].Value) }
    }
  } catch {}
}
foreach ($p in $paths) {
  try { $r = Invoke-WebRequest "$base$p" -UseBasicParsing -TimeoutSec 90; Add-Content $warmLog "warm $p $($r.StatusCode)" }
  catch { Add-Content $warmLog "warm $p failed: $($_.Exception.Message)" }
}

# Keep the scheduled task alive while the site runs, so Task Scheduler can
# restart it if the server stops.
if ($proc) { $proc.WaitForExit() }
