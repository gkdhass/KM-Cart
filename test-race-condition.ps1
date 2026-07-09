# Test script for MongoDB serverless race condition fix
# Tests concurrent requests to verify no 500 errors occur

$API_URL = "https://km-cart.vercel.app/api/products"
$NUM_REQUESTS = 20

Write-Host "═══════════════════════════════════════════════════════════=" -ForegroundColor Cyan
Write-Host "  Testing MongoDB Race Condition Fix" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════=" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoint: $API_URL" -ForegroundColor White
Write-Host "Concurrent Requests: $NUM_REQUESTS" -ForegroundColor White
Write-Host ""
Write-Host "Sending $NUM_REQUESTS concurrent requests..." -ForegroundColor Yellow
Write-Host ""

# Array to store jobs
$jobs = @()

# Send concurrent requests
for ($i = 1; $i -le $NUM_REQUESTS; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url)
        try {
            $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -TimeoutSec 30
            return $response.StatusCode
        } catch {
            if ($_.Exception.Response) {
                return [int]$_.Exception.Response.StatusCode
            }
            return 0
        }
    } -ArgumentList $API_URL
    $jobs += $job
}

# Wait for all jobs to complete
Write-Host "Waiting for responses..." -ForegroundColor Yellow
$results = $jobs | Wait-Job | Receive-Job

# Clean up jobs
$jobs | Remove-Job

# Display results
Write-Host ""
Write-Host "Response Status Codes:" -ForegroundColor White
$results | ForEach-Object { Write-Host $_ -NoNewline -ForegroundColor $(if ($_ -eq 200) { "Green" } else { "Red" }); Write-Host " " -NoNewline }
Write-Host ""
Write-Host ""

# Count results
$successCount = ($results | Where-Object { $_ -eq 200 }).Count
$errorCount = ($results | Where-Object { $_ -eq 500 }).Count
$totalCount = $results.Count

Write-Host "═══════════════════════════════════════════════════════════=" -ForegroundColor Cyan
Write-Host "  Results Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════=" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Requests: $totalCount" -ForegroundColor White
Write-Host "Success (200): " -NoNewline -ForegroundColor White
Write-Host "$successCount" -ForegroundColor $(if ($successCount -eq $NUM_REQUESTS) { "Green" } else { "Yellow" })
Write-Host "Errors (500): " -NoNewline -ForegroundColor White
Write-Host "$errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($successCount -eq $NUM_REQUESTS -and $errorCount -eq 0) {
    Write-Host "✅ SUCCESS: All requests returned 200 - Race condition FIXED!" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED: Some requests returned 500 - Race condition still present" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════=" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check Vercel Function Logs for connection messages" -ForegroundColor White
Write-Host "2. Look for: '[DB] ✅ MongoDB Connected: <hostname>'" -ForegroundColor White
Write-Host "3. Look for: '[DB] 📦 Database: gkcart'" -ForegroundColor White
Write-Host "4. Verify NO 'undefined' in connection logs" -ForegroundColor White
Write-Host ""
Write-Host "Vercel Logs: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "             → Your Project → Deployments → Latest → Functions" -ForegroundColor Cyan
Write-Host ""
