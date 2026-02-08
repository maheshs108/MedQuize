# Run Next.js dev server and show output
Write-Host "Starting MedQuize dev server..." -ForegroundColor Cyan
Write-Host ""
$env:NODE_ENV = "development"
npx next dev
