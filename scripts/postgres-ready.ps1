# scripts/postgres-ready.ps1
# Run this AFTER you click "Create Database → Postgres" in Vercel dashboard
# (https://vercel.com/dashboard/stores)
#
# This will:
#   1. Pull POSTGRES_URL from Vercel into local .env.local
#   2. Run Drizzle migrations (17 tables, pgvector extension, HNSW index)
#   3. Seed 10 KB entries across 6 domains
#   4. Smoke test: SELECT count(*) FROM kb_entries should be 10
#
# Usage: pnpm dlx tsx scripts/postgres-ready.ps1
#        or: powershell -ExecutionPolicy Bypass -File scripts/postgres-ready.ps1

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..  # project root

Write-Host "1/4 Pulling POSTGRES_URL from Vercel ..." -ForegroundColor Cyan
pnpm dlx vercel@latest env pull .env.local --environment production 2>&1 | Select-Object -First 5
if ($LASTEXITCODE -ne 0) { throw "env pull failed" }

if (-not (Select-String -Path .env.local -Pattern '^POSTGRES_URL=')) {
    throw "POSTGRES_URL not in .env.local - did you create Vercel Postgres?"
}

Write-Host "`n2/4 Running migrations ..." -ForegroundColor Cyan
pnpm db:migrate 2>&1 | Select-Object -Last 5
if ($LASTEXITCODE -ne 0) { throw "db:migrate failed" }

Write-Host "`n3/4 Seeding 10 KB entries ..." -ForegroundColor Cyan
pnpm db:seed 2>&1 | Select-Object -Last 5
if ($LASTEXITCODE -ne 0) { throw "db:seed failed" }

Write-Host "`n4/4 Smoke testing DB ..." -ForegroundColor Cyan
$checkSql = "SELECT count(*)::int FROM kb_entries;"
$envContent = Get-Content .env.local | Where-Object { $_ -match '^POSTGRES_URL=' } | Select-Object -First 1
$dbUrl = ($envContent -split '=', 2)[1].Trim().Trim('"', "'")
# Use a tiny Node script to query (works in any shell)
$nodeCmd = @"
const postgres = require('postgres');
const url = process.env.TEMP_DB_URL;
const sql = postgres(url, { max: 1, connect_timeout: 10 });
(async () => {
  const r = await sql`SELECT count(*)::int as n FROM kb_entries`;
  console.log('kb_entries count =', r[0].n);
  await sql.end();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
"@
$TEMP_DB_URL = $dbUrl
node -e $nodeCmd
if ($LASTEXITCODE -ne 0) { throw "DB smoke test failed" }

Write-Host "`nDone. Vercel will auto-inject POSTGRES_URL on next request." -ForegroundColor Green
Write-Host "Sign-up + intake + dashboard routes will work after ~30s (Vercel function cold start)." -ForegroundColor Green
