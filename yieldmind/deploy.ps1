# YieldMind Deployment Script for Foundry (PowerShell)
# Run: .\deploy.ps1

$ErrorActionPreference = "Stop"

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#].+?)=(.+)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

Write-Host "🚀 Deploying YieldMind to Base Sepolia..." -ForegroundColor Cyan
Write-Host ""

# Get deployer address
$DEPLOYER = cast wallet address $env:PRIVATE_KEY
Write-Host "Deployer: $DEPLOYER"
Write-Host ""

# Deploy Treasury
Write-Host "📦 Deploying YieldTreasury..." -ForegroundColor Yellow
$TREASURY_OUTPUT = forge create src/YieldTreasury.sol:YieldTreasury `
  --rpc-url $env:BASE_SEPOLIA_RPC `
  --private-key $env:PRIVATE_KEY `
  --constructor-args `
    $DEPLOYER `
    0x0000000000000000000000000000000000000001 `
    0x0000000000000000000000000000000000000002

$TREASURY = ($TREASURY_OUTPUT | Select-String "Deployed to:").ToString().Split()[-1]
Write-Host "✅ Treasury deployed: $TREASURY" -ForegroundColor Green
Write-Host ""

# Wait for deployment
Start-Sleep -Seconds 5

# Deploy Agent
Write-Host "📦 Deploying YieldMindAgent..." -ForegroundColor Yellow
$AGENT_OUTPUT = forge create src/YieldMindAgent.sol:YieldMindAgent `
  --rpc-url $env:BASE_SEPOLIA_RPC `
  --private-key $env:PRIVATE_KEY `
  --constructor-args $TREASURY

$AGENT = ($AGENT_OUTPUT | Select-String "Deployed to:").ToString().Split()[-1]
Write-Host "✅ Agent deployed: $AGENT" -ForegroundColor Green
Write-Host ""

# Wait for deployment
Start-Sleep -Seconds 5

# Set agent in treasury
Write-Host "🔗 Linking agent to treasury..." -ForegroundColor Yellow
cast send $TREASURY `
  "setAgent(address)" `
  $AGENT `
  --rpc-url $env:BASE_SEPOLIA_RPC `
  --private-key $env:PRIVATE_KEY `
  --gas-limit 100000

Write-Host "✅ Agent linked" -ForegroundColor Green
Write-Host ""

# Fund treasury
Write-Host "💰 Funding treasury with 0.1 ETH..." -ForegroundColor Yellow
cast send $TREASURY `
  "deposit()" `
  --value 0.1ether `
  --rpc-url $env:BASE_SEPOLIA_RPC `
  --private-key $env:PRIVATE_KEY `
  --gas-limit 200000

Write-Host "✅ Treasury funded" -ForegroundColor Green
Write-Host ""

# Check status
Write-Host "📊 Checking status..." -ForegroundColor Yellow
$PRINCIPAL = cast call $TREASURY "principalWstETH()" --rpc-url $env:BASE_SEPOLIA_RPC
$YIELD = cast call $TREASURY "availableYield()" --rpc-url $env:BASE_SEPOLIA_RPC

Write-Host "Principal: $PRINCIPAL"
Write-Host "Yield: $YIELD"
Write-Host ""

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Add these to your .env file:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TREASURY_ADDRESS=$TREASURY"
Write-Host "AGENT_ADDRESS=$AGENT"
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add addresses to .env"
Write-Host "2. Verify contracts on Basescan (see FOUNDRY_SETUP.md)"
Write-Host "3. Run agent: npm run agent"
