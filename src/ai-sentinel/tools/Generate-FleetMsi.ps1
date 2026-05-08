$ErrorActionPreference = "Stop"
$env:DEBUG = "false"

$root = Split-Path -Parent $PSScriptRoot
$fleetctl = Join-Path $root ".tools\fleetctl\fleetctl_v4.84.2_windows_amd64\fleetctl.exe"
$outDir = Join-Path $root "instaladores"
$outFile = Join-Path $outDir "fleet-osquery.msi"
$cert = Join-Path $root "certs\fleet.crt"
$enrollSecret = $env:FLEET_ENROLL_SECRET

if (-not $enrollSecret) {
    throw "Set FLEET_ENROLL_SECRET before generating the Fleet MSI."
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

& $fleetctl package `
    --type msi `
    --fleet-url=https://fleet.local:1337 `
    --enroll-secret=$enrollSecret `
    --fleet-certificate $cert `
    --fleet-desktop `
    --outfile $outFile

Write-Host "Generated installer: $outFile"
