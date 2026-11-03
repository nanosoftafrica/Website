# Run elevated once (needs a UAC OK). Registers a boot-time task that runs
# scripts\start-prod.ps1 as this user without needing a logon.
$out = Join-Path $env:TEMP 'nanosoft-autostart-result.txt'
try {
  $script = 'C:\Users\allan\Documents\Website Nanosoft.africa\Nanosoft Website\scripts\start-prod.ps1'
  $a = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$script`"" -WorkingDirectory (Split-Path -Parent (Split-Path -Parent $script))
  $t = New-ScheduledTaskTrigger -AtStartup
  $t.Delay = 'PT45S'
  $p = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType S4U -RunLevel Limited
  $s = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew
  Register-ScheduledTask -TaskName 'Nanosoft Website (port 3001)' -Action $a -Trigger $t -Principal $p -Settings $s -Description 'Starts the Nanosoft website production copy on port 3001 at boot and warms the main pages.' -Force | Out-Null
  $task = Get-ScheduledTask -TaskName 'Nanosoft Website (port 3001)'
  "OK $($task.State) $($task.Principal.UserId) $($task.Principal.LogonType)" | Set-Content $out
} catch {
  "FAILED $($_.Exception.Message)" | Set-Content $out
}
