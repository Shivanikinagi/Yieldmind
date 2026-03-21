import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  
  // Placeholder addresses for testnet (replace with actual testnet addresses if available)
  const WSTETH_PLACEHOLDER = "0x0000000000000000000000000000000000000001";
  const LIDO_PLACEHOLDER = "0x0000000000000000000000000000000000000002";
  
  // Deploy YieldTreasury first (agent address will be set after)
  console.log("\nDeploying YieldTreasury...");
  const YieldTreasury = await ethers.getContractFactory("YieldTreasury");
  const treasury = await YieldTreasury.deploy(
    deployer.address, // temporary agent address
    WSTETH_PLACEHOLDER,
    LIDO_PLACEHOLDER
  );
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✓ YieldTreasury deployed to:", treasuryAddress);
  
  // Deploy YieldMindAgent
  console.log("\nDeploying YieldMindAgent...");
  const YieldMindAgent = await ethers.getContractFactory("YieldMindAgent");
  const agent = await YieldMindAgent.deploy(treasuryAddress);
  await agent.waitForDeployment();
  const agentAddress = await agent.getAddress();
  console.log("✓ YieldMindAgent deployed to:", agentAddress);
  
  // Set agent address in treasury
  console.log("\nSetting agent address in treasury...");
  const setAgentTx = await treasury.setAgent(agentAddress);
  await setAgentTx.wait();
  console.log("✓ Agent address set");
  
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("TREASURY_ADDRESS=", treasuryAddress);
  console.log("AGENT_ADDRESS=", agentAddress);
  console.log("\nAdd these to your .env file!");
  console.log("\nTo verify on Basescan:");
  console.log(`npx hardhat verify --network base_sepolia ${treasuryAddress} ${deployer.address} ${WSTETH_PLACEHOLDER} ${LIDO_PLACEHOLDER}`);
  console.log(`npx hardhat verify --network base_sepolia ${agentAddress} ${treasuryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
