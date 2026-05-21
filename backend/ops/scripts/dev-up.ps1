$ErrorActionPreference = "Stop"

docker compose -f "$PSScriptRoot/../compose/compose.dev.yml" up -d
