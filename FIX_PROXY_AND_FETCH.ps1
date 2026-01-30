# Fix Proxy Settings and Fetch from GitHub
# Run this script in PowerShell (may need Administrator privileges)

Write-Host "Fixing proxy settings and fetching from GitHub..." -ForegroundColor Yellow

# Navigate to repository
Set-Location "c:\Users\david\Documents\DFM_V2-main"

# Unset proxy environment variables for this session
$env:HTTP_PROXY = $null
$env:HTTPS_PROXY = $null
$env:http_proxy = $null
$env:https_proxy = $null

# Configure git to not use proxy
git config --local http.proxy ""
git config --local https.proxy ""

# Verify remote is set
Write-Host "`nRemote configuration:" -ForegroundColor Cyan
git remote -v

# Try to fetch
Write-Host "`nAttempting to fetch from GitHub..." -ForegroundColor Cyan
git fetch origin

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully fetched from GitHub!" -ForegroundColor Green
    
    Write-Host "`nChecking differences..." -ForegroundColor Cyan
    git log HEAD..origin/main --oneline
    
    Write-Host "`nReady to merge. Run:" -ForegroundColor Yellow
    Write-Host "  git merge origin/main --allow-unrelated-histories" -ForegroundColor White
} else {
    Write-Host "`n❌ Fetch failed. Error code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "`nTry these steps:" -ForegroundColor Yellow
    Write-Host "1. Unset proxy environment variables permanently:" -ForegroundColor White
    Write-Host "   [Environment]::SetEnvironmentVariable('HTTP_PROXY', `$null, 'User')" -ForegroundColor Gray
    Write-Host "   [Environment]::SetEnvironmentVariable('HTTPS_PROXY', `$null, 'User')" -ForegroundColor Gray
    Write-Host "   Then restart PowerShell" -ForegroundColor Gray
    Write-Host "`n2. Or use GitHub Desktop or another Git client" -ForegroundColor White
    Write-Host "`n3. Or manually download and merge" -ForegroundColor White
}
