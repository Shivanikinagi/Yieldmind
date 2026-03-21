import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("\n🚀 Deploying YieldMind contracts to Base Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH\n");

  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.error("❌ Insufficient balance. Need at least 0.01 ETH for deployment.");
    console.log("Get testnet ETH from: https://www.alchemy.com/faucets/base-sepolia");
    process.exit(1);
  }

  // Mock addresses for testnet
  const MOCK_AGENT = "0x0000000000000000000000000000000000000000";
  const MOCK_WSTETH = "0x0000000000000000000000000000000000000001";
  const MOCK_LIDO = "0x0000000000000000000000000000000000000002";

  // Deploy YieldTreasury
  console.log("📦 Deploying YieldTreasury...");
  const YieldTreasury = await ethers.getContractFactory("YieldTreasury");
  const treasury = await YieldTreasury.deploy(MOCK_AGENT, MOCK_WSTETH, MOCK_LIDO);
  await treasury.deployed();
  console.log("✅ YieldTreasury deployed to:", treasury.address);

  // Deploy YieldMindAgent
  console.log("\n📦 Deploying YieldMindAgent...");
  const YieldMindAgent = await ethers.getContractFactory("YieldMindAgent");
  const agent = await YieldMindAgent.deploy(treasury.address);
  await agent.deployed();
  console.log("✅ YieldMindAgent deployed to:", agent.address);

  // Link agent to treasury
  console.log("\n🔗 Linking agent to treasury...");
  const tx = await treasury.setAgent(agent.address);
  await tx.wait();
  console.log("✅ Agent linked successfully");

  // Fund treasury
  console.log("\n💰 Funding treasury with 0.01 ETH...");
  const fundTx = await treasury.deposit({ value: ethers.utils.parseEther("0.01") });
  await fundTx.wait();
  console.log("✅ Treasury funded with 0.01 ETH");

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const principal = await treasury.principalWstETH();
  const yieldAvailable = await treasury.availableYield();
  console.log("Principal locked:", ethers.utils.formatEther(principal), "ETH");
  console.log("Yield available:", ethers.utils.formatEther(yieldAvailable), "ETH");

  // Update .env file
  console.log("\n📝 Updating .env file...");
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = fs.readFileSync(envPath, "utf8");
  
  envContent = envContent.replace(
    /TREASURY_ADDRESS=.*/,
    `TREASURY_ADDRESS=${treasury.address}`
  );
  envContent = envContent.replace(
    /AGENT_ADDRESS=.*/,
    `AGENT_ADDRESS=${agent.address}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file updated");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   Treasury:", treasury.address);
  console.log("   Agent:   ", agent.address);
  console.log("\n🔗 View on Basescan:");
  console.log("   Treasury:", `https://sepolia.basescan.org/address/${treasury.address}`);
  console.log("   Agent:   ", `https://sepolia.basescan.org/address/${agent.address}`);
  console.log("\n✅ Next Steps:");
  console.log("   1. Run: npm run agent");
  console.log("   2. Watch your agent fund itself from yield!");
  console.log("   3. Record demo video");
  console.log("   4. Submit to Lido track\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
