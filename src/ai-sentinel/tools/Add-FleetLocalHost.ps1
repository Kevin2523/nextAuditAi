$ErrorActionPreference = "Stop"

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entry = "127.0.0.1 fleet.local"
$content = Get-Content $hostsPath -ErrorAction Stop

if ($content -notmatch "(^|\s)fleet\.local(\s|$)") {
    Add-Content -Path $hostsPath -Value $entry
}

ipconfig /flushdns | Out-Null
Write-Host "fleet.local configured in hosts."
