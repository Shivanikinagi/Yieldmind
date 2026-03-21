#!/bin/bash

# YieldMind Deployment Script for Foundry
# Make executable: chmod +x deploy.sh

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "🚀 Deploying YieldMind to Base Sepolia..."
echo ""

# Get deployer address
DEPLOYER=$(cast wallet address $PRIVATE_KEY)
echo "Deployer: $DEPLOYER"
echo ""

# Deploy Treasury
echo "📦 Deploying YieldTreasury..."
TREASURY_OUTPUT=$(forge create src/YieldTreasury.sol:YieldTreasury \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --constructor-args \
    $DEPLOYER \
    0x0000000000000000000000000000000000000001 \
    0x0000000000000000000000000000000000000002)

TREASURY=$(echo "$TREASURY_OUTPUT" | grep "Deployed to:" | awk '{print $3}')
echo "✅ Treasury deployed: $TREASURY"
echo ""

# Wait for deployment
sleep 5

# Deploy Agent
echo "📦 Deploying YieldMindAgent..."
AGENT_OUTPUT=$(forge create src/YieldMindAgent.sol:YieldMindAgent \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --constructor-args $TREASURY)

AGENT=$(echo "$AGENT_OUTPUT" | grep "Deployed to:" | awk '{print $3}')
echo "✅ Agent deployed: $AGENT"
echo ""

# Wait for deployment
sleep 5

# Set agent in treasury
echo "🔗 Linking agent to treasury..."
cast send $TREASURY \
  "setAgent(address)" \
  $AGENT \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --gas-limit 100000

echo "✅ Agent linked"
echo ""

# Fund treasury
echo "💰 Funding treasury with 0.1 ETH..."
cast send $TREASURY \
  "deposit()" \
  --value 0.1ether \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --gas-limit 200000

echo "✅ Treasury funded"
echo ""

# Check status
echo "📊 Checking status..."
PRINCIPAL=$(cast call $TREASURY "principalWstETH()" --rpc-url $BASE_SEPOLIA_RPC)
YIELD=$(cast call $TREASURY "availableYield()" --rpc-url $BASE_SEPOLIA_RPC)

echo "Principal: $PRINCIPAL"
echo "Yield: $YIELD"
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "================================================"
echo "Add these to your .env file:"
echo "================================================"
echo "TREASURY_ADDRESS=$TREASURY"
echo "AGENT_ADDRESS=$AGENT"
echo "================================================"
echo ""
echo "Verify contracts on Basescan:"
echo "forge verify-contract $TREASURY src/YieldTreasury.sol:YieldTreasury --chain base-sepolia --etherscan-api-key \$BASESCAN_API_KEY --constructor-args \$(cast abi-encode 'constructor(address,address,address)' $DEPLOYER 0x0000000000000000000000000000000000000001 0x0000000000000000000000000000000000000002)"
echo ""
echo "forge verify-contract $AGENT src/YieldMindAgent.sol:YieldMindAgent --chain base-sepolia --etherscan-api-key \$BASESCAN_API_KEY --constructor-args \$(cast abi-encode 'constructor(address)' $TREASURY)"
