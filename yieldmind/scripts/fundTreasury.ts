import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  if (!treasuryAddress) {
    throw new Error("TREASURY_ADDRESS not set in .env");
  }
  
  console.log("Funding treasury with account:", deployer.address);
  console.log("Treasury address:", treasuryAddress);
  
  const treasury = await ethers.getContractAt("YieldTreasury", treasuryAddress);
  
  // Deposit 0.1 ETH to generate yield
  const depositAmount = ethers.parseEther("0.1");
  console.log("\nDepositing", ethers.formatEther(depositAmount), "ETH...");
  
  const tx = await treasury.deposit({ value: depositAmount });
  const receipt = await tx.wait();
  console.log("✓ Deposit successful!");
  console.log("Transaction hash:", receipt?.hash);
  
  // Check balances
  const principal = await treasury.principalWstETH();
  const yieldAvailable = await treasury.availableYield();
  
  console.log("\n=== Treasury Status ===");
  console.log("Principal:", ethers.formatEther(principal), "ETH");
  console.log("Yield available:", ethers.formatEther(yieldAvailable), "ETH");
  console.log("\nNote: Yield will accrue over time (simulated at 4% APY on testnet)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
