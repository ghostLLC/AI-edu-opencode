# scripts/watch-postgres.ps1
# Polls Vercel env every 30s. When POSTGRES_URL appears (i.e., user has clicked
# "Create Database -> Postgres" in Vercel dashboard), auto-runs postgres-ready.ps1
# and then smoke tests DB routes.
#
# Usage:  powershell -ExecutionPolicy Bypass -File scripts/watch-postgres.ps1
#         (or just .\scripts\watch-postgres.ps1)
#
# Stop:   Ctrl+C
#
# The script will print "[DETECTED] POSTGRES_URL" then run migrations + seed.
# After that, Vercel auto-injects the new env into running functions on next request.

$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot\..

$interval = 30  # seconds between polls
$maxWait = 0    # 0 = forever, or set a max wait in seconds

Write-Host "Watch-Postgres v1" -ForegroundColor Cyan
Write-Host "  Polling Vercel env every ${interval}s for POSTGRES_URL..." -ForegroundColor Cyan
Write-Host "  Trigger: User creates Vercel Postgres in dashboard:" -ForegroundColor Yellow
Write-Host "    https://vercel.com/dashboard/stores" -ForegroundColor Yellow
Write-Host "  Stop: Ctrl+C" -ForegroundColor Yellow
Write-Host ""

$elapsed = 0
$attempt = 0
while ($true) {
    $attempt++
    $timestamp = Get-Date -Format "HH:mm:ss"
    try {
        $envList = pnpm dlx vercel@latest env ls production 2>&1 | Out-String
        if ($envList -match 'POSTGRES_URL\s+Encrypted') {
            Write-Host "[$timestamp] [DETECTED] POSTGRES_URL is in Vercel env!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Running scripts/postgres-ready.ps1 ..." -ForegroundColor Cyan
            & "$PSScriptRoot\postgres-ready.ps1"
            $rc = $LASTEXITCODE
            if ($rc -eq 0) {
                Write-Host ""
                Write-Host "Migrations + seed complete. Waiting 30s for Vercel env propagation ..." -ForegroundColor Cyan
                Start-Sleep -Seconds 30
                Write-Host ""
                Write-Host "Smoke testing DB routes ..." -ForegroundColor Cyan
                $signUpBody = '{"name":"watcher-test","email":"watcher-test@example.com","password":"watcher12345"}'
                try {
                    $r = Invoke-WebRequest -Uri "https://ai-edu-opencode.vercel.app/api/auth/sign-up" -UseBasicParsing -Method POST -ContentType "application/json" -Body $signUpBody -TimeoutSec 30
                    $code = $r.StatusCode
                    Write-Host "  POST /api/auth/sign-up  HTTP $code" -ForegroundColor $(if ($code -eq 201 -or $code -eq 200 -or $code -eq 409) { "Green" } else { "Red" })
                    if ($code -eq 201 -or $code -eq 200) { Write-Host "  Sign-up created a user. DB is working!" -ForegroundColor Green }
                    elseif ($code -eq 409) { Write-Host "  Sign-up returned 409 (user exists from a previous run). DB is working!" -ForegroundColor Green }
                } catch {
                    $code = $_.Exception.Response.StatusCode.value__
                    Write-Host "  POST /api/auth/sign-up  HTTP $code" -ForegroundColor $(if ($code -eq 409) { "Green" } else { "Red" })
                    if ($code -eq 409) { Write-Host "  User exists from a previous run. DB is working!" -ForegroundColor Green }
                }
                Write-Host ""
                Write-Host "[DONE] Auto-deploy sequence complete." -ForegroundColor Green
                exit 0
            } else {
                Write-Host "[FAIL] postgres-ready.ps1 exited $rc" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "[$timestamp] poll #$attempt - POSTGRES_URL not yet present (elapsed: ${elapsed}s)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "[$timestamp] poll error: $_" -ForegroundColor Yellow
    }
    Start-Sleep -Seconds $interval
    $elapsed += $interval
    if ($maxWait -gt 0 -and $elapsed -ge $maxWait) {
        Write-Host "Max wait ${maxWait}s reached. Exiting." -ForegroundColor Yellow
        exit 0
    }
}
