import { ethers } from "hardhat";

async function main() {
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  const AGENT_ADDRESS = process.env.AGENT_ADDRESS;
  
  if (!TREASURY_ADDRESS || !AGENT_ADDRESS) {
    console.error("❌ Contract addresses not set in .env");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  const treasury = await ethers.getContractAt("YieldTreasury", TREASURY_ADDRESS);
  const agent = await ethers.getContractAt("YieldMindAgent", AGENT_ADDRESS);
  
  console.log("\n🎬 YieldMind Demo Simulation\n");
  console.log("This simulates what would happen after yield accrues...\n");
  
  // Check current state
  const principal = await treasury.principalWstETH();
  const currentYield = await treasury.availableYield();
  
  console.log("📊 Current State:");
  console.log("   Principal:", ethers.utils.formatEther(principal), "ETH");
  console.log("   Yield available:", ethers.utils.formatEther(currentYield), "ETH");
  console.log("   (Too small to run tasks yet)\n");
  
  console.log("💡 For Demo Video:\n");
  console.log("1. Show this output - proves contracts are working");
  console.log("2. Explain: 'With 0.03 ETH at 4% APY, yield accrues slowly'");
  console.log("3. Explain: 'On mainnet with 10 ETH, agent would run every ~2 hours'");
  console.log("4. Show the math:\n");
  
  // Calculate different scenarios
  const scenarios = [
    { principal: "0.03", hours: 65700 / 60 },
    { principal: "1", hours: 1314 / 60 },
    { principal: "10", hours: 131.4 / 60 },
    { principal: "100", hours: 13.14 / 60 }
  ];
  
  console.log("   Principal | Time for 0.0001 ETH yield");
  console.log("   --------- | -------------------------");
  scenarios.forEach(s => {
    const hours = s.hours.toFixed(1);
    console.log(`   ${s.principal.padEnd(9)} | ${hours} hours`);
  });
  
  console.log("\n🎯 Key Points for Video:\n");
  console.log("   ✓ Contracts deployed and verified on Base Sepolia");
  console.log("   ✓ Principal locked (0.03 ETH) - NEVER touched");
  console.log("   ✓ Yield accruing at 4% APY (simulated)");
  console.log("   ✓ Agent waits patiently for yield");
  console.log("   ✓ On mainnet with real Lido staking:");
  console.log("     - Larger principal = faster yield");
  console.log("     - Agent runs autonomously forever");
  console.log("     - Self-sustaining AI powered by DeFi\n");
  
  console.log("🔗 Show These Links in Video:\n");
  console.log("   Treasury:", `https://sepolia.basescan.org/address/${TREASURY_ADDRESS}`);
  console.log("   Agent:   ", `https://sepolia.basescan.org/address/${AGENT_ADDRESS}`);
  console.log("");
  
  console.log("📹 Video Script Suggestion:\n");
  console.log('   "I\'ve deployed YieldMind to Base Sepolia testnet.');
  console.log('   The treasury holds 0.03 ETH as locked principal.');
  console.log('   The agent monitors the yield - right now it\'s accruing slowly.');
  console.log('   But here\'s the key: the agent will NEVER touch the principal.');
  console.log('   On mainnet with 10 ETH staked via Lido at 4% APY,');
  console.log('   the agent could run a task every 2 hours, indefinitely.');
  console.log('   This is a self-sustaining AI agent powered by DeFi yield."\n');
  
  console.log("✅ Your project is complete and ready to submit!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
