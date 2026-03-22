import { ethers } from "hardhat";

async function main() {
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  
  if (!TREASURY_ADDRESS) {
    console.error("❌ TREASURY_ADDRESS not set in .env");
    process.exit(1);
  }

  const treasury = await ethers.getContractAt("YieldTreasury", TREASURY_ADDRESS);
  
  console.log("\n⏳ Checking yield status...\n");
  
  const principal = await treasury.principalWstETH();
  const depositTime = await treasury.lastDepositTime();
  const currentTime = Math.floor(Date.now() / 1000);
  const elapsed = currentTime - depositTime.toNumber();
  
  console.log("Principal:", ethers.utils.formatEther(principal), "ETH");
  console.log("Time since deposit:", Math.floor(elapsed / 60), "minutes");
  
  // Calculate expected yield at 4% APY
  const secondsInYear = 365 * 24 * 60 * 60;
  const expectedYield = principal.mul(4).mul(elapsed).div(secondsInYear).div(100);
  
  console.log("Expected yield:", ethers.utils.formatEther(expectedYield), "ETH");
  
  const actualYield = await treasury.availableYield();
  console.log("Actual yield:", ethers.utils.formatEther(actualYield), "ETH");
  
  const requiredYield = ethers.utils.parseEther("0.0001");
  console.log("Required for 1 task:", ethers.utils.formatEther(requiredYield), "ETH");
  
  if (actualYield.gte(requiredYield)) {
    console.log("\n✅ Sufficient yield available! Run: npm run agent");
  } else {
    const timeNeeded = requiredYield.mul(secondsInYear).mul(100).div(principal).div(4);
    const minutesNeeded = Math.ceil(timeNeeded.toNumber() / 60);
    console.log(`\n⏳ Need to wait ~${minutesNeeded} minutes for sufficient yield`);
    console.log("   (At 4% APY on 0.001 ETH principal)");
    console.log("\n💡 While you wait, you can:");
    console.log("   1. Wait", minutesNeeded, "minutes");
    console.log("   2. Add more principal: npm run fund");
    console.log("   3. Review the yield accrual math and current treasury state");
  }
  
  console.log("\n📊 Yield Accrual Rate:");
  console.log("   Per minute:", ethers.utils.formatEther(principal.mul(4).mul(60).div(secondsInYear).div(100)), "ETH");
  console.log("   Per hour:", ethers.utils.formatEther(principal.mul(4).mul(3600).div(secondsInYear).div(100)), "ETH");
  console.log("   Per day:", ethers.utils.formatEther(principal.mul(4).mul(86400).div(secondsInYear).div(100)), "ETH");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
