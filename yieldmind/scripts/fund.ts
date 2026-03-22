import { ethers } from "hardhat";

async function main() {
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  
  if (!TREASURY_ADDRESS) {
    console.error("❌ TREASURY_ADDRESS not set in .env");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  const balance = await signer.getBalance();
  
  console.log("\n💰 Funding Treasury");
  console.log("Account:", signer.address);
  console.log("Balance:", ethers.utils.formatEther(balance), "ETH");
  
  // Fund with 0.001 ETH (minimum required)
  const fundAmount = ethers.utils.parseEther("0.001");
  
  if (balance.lt(fundAmount.add(ethers.utils.parseEther("0.001")))) {
    console.error("\n❌ Insufficient balance. Need at least 0.0011 ETH (0.001 for deposit + 0.001 for gas)");
    console.log("Get testnet ETH from: https://www.alchemy.com/faucets/base-sepolia");
    process.exit(1);
  }

  const treasury = await ethers.getContractAt("YieldTreasury", TREASURY_ADDRESS);
  
  console.log("\n📤 Sending 0.001 ETH to treasury...");
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
  console.log("\n✅ Ready to run agent: npm run agent\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
