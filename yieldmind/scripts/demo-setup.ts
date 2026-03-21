import { ethers } from "hardhat";

async function main() {
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  
  if (!TREASURY_ADDRESS) {
    console.error("❌ TREASURY_ADDRESS not set in .env");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  const balance = await signer.getBalance();
  
  console.log("\n🎬 Setting up demo with sufficient principal...\n");
  console.log("Account:", signer.address);
  console.log("Balance:", ethers.utils.formatEther(balance), "ETH");
  
  // For demo, we need enough principal to generate 0.0001 ETH yield quickly
  // At 4% APY, to get 0.0001 ETH in 1 minute:
  // yield_per_minute = principal * 0.04 / (365 * 24 * 60)
  // 0.0001 = principal * 0.04 / 525600
  // principal = 0.0001 * 525600 / 0.04 = 1.314 ETH
  
  // Let's use 0.03 ETH for a reasonable demo (will take ~44 minutes for 0.0001 ETH yield)
  const fundAmount = ethers.utils.parseEther("0.03");
  
  if (balance.lt(fundAmount.add(ethers.utils.parseEther("0.001")))) {
    console.error("\n❌ Insufficient balance. Need at least 0.031 ETH");
    console.log("Current balance:", ethers.utils.formatEther(balance), "ETH");
    console.log("\nGet more testnet ETH from: https://www.alchemy.com/faucets/base-sepolia");
    process.exit(1);
  }

  const treasury = await ethers.getContractAt("YieldTreasury", TREASURY_ADDRESS);
  
  console.log("📤 Depositing 0.03 ETH to treasury...");
  const tx = await treasury.deposit({ value: fundAmount });
  console.log("Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ Treasury funded!");
  
  // Check status
  const principal = await treasury.principalWstETH();
  const yieldAvailable = await treasury.availableYield();
  
  console.log("\n📊 Treasury Status:");
  console.log("Principal:", ethers.utils.formatEther(principal), "ETH");
  console.log("Yield available:", ethers.utils.formatEther(yieldAvailable), "ETH");
  
  // Calculate time needed
  const requiredYield = ethers.utils.parseEther("0.0001");
  const secondsInYear = 365 * 24 * 60 * 60;
  const timeNeeded = requiredYield.mul(secondsInYear).mul(100).div(principal).div(4);
  const minutesNeeded = Math.ceil(timeNeeded.toNumber() / 60);
  
  console.log("\n⏰ Time Estimates:");
  console.log("   Minutes until 0.0001 ETH yield:", minutesNeeded);
  console.log("   (Required for 1 agent task)");
  
  console.log("\n💡 Demo Tips:");
  console.log("   1. Wait", minutesNeeded, "minutes, then run: npm run agent");
  console.log("   2. Or explain in video: 'Agent waits for yield to accrue'");
  console.log("   3. Show contract on Basescan to prove principal is locked");
  console.log("   4. Emphasize: Principal NEVER touched, only yield spent");
  
  console.log("\n🔗 View on Basescan:");
  console.log("   https://sepolia.basescan.org/address/" + TREASURY_ADDRESS);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
