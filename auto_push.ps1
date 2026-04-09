$action = {
    $status = & "C:\Program Files\Git\cmd\git.exe" status --porcelain
    if ($status) {
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Changes detected. Committing and pushing..." -ForegroundColor Yellow
        & "C:\Program Files\Git\cmd\git.exe" add .
        & "C:\Program Files\Git\cmd\git.exe" commit -m "Auto-commit: saved changes"
        & "C:\Program Files\Git\cmd\git.exe" push origin main
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Push complete." -ForegroundColor Green
    }
}

Write-Host ">>> WearYourStyle Auto-Push Service Started <<<" -ForegroundColor Cyan
Write-Host "Monitoring workspace for file changes every 15 seconds..."
Write-Host "Keep this window open to continue auto-pushing." -ForegroundColor DarkGray
while ($true) {
    &$action
    Start-Sleep -Seconds 15
}
