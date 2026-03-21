import { ethers } from "hardhat";

async function main() {
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  const agentAddress = process.env.AGENT_ADDRESS;
  
  if (!treasuryAddress || !agentAddress) {
    throw new Error("Contract addresses not set in .env");
  }
  
  console.log("=== YieldMind Status ===\n");
  
  const treasury = await ethers.getContractAt("YieldTreasury", treasuryAddress);
  const agent = await ethers.getContractAt("YieldMindAgent", agentAddress);
  
  // Treasury info
  const principal = await treasury.principalWstETH();
  const yieldAvailable = await treasury.availableYield();
  const yieldSpent = await treasury.yieldSpent();
  const inferenceCount = await treasury.inferenceCount();
  const owner = await treasury.owner();
  const agentAddr = await treasury.agent();
  
  console.log("Treasury:", treasuryAddress);
  console.log("Owner:", owner);
  console.log("Agent:", agentAddr);
  console.log("");
  console.log("Principal (locked):", ethers.formatEther(principal), "ETH");
  console.log("Yield available:", ethers.formatEther(yieldAvailable), "ETH");
  console.log("Yield spent:", ethers.formatEther(yieldSpent), "ETH");
  console.log("Inferences funded:", inferenceCount.toString());
  console.log("");
  
  // Agent info
  const taskCount = await agent.taskCount();
  console.log("Agent:", agentAddress);
  console.log("Total tasks:", taskCount.toString());
  console.log("");
  
  // Show recent tasks
  if (taskCount > 0n) {
    console.log("=== Recent Tasks ===\n");
    const start = taskCount > 3n ? taskCount - 2n : 1n;
    
    for (let i = start; i <= taskCount; i++) {
      const task = await agent.tasks(i);
      console.log(`Task #${i}:`);
      console.log(`  Prompt: ${task.prompt.slice(0, 60)}...`);
      console.log(`  Completed: ${task.completed}`);
      console.log(`  Yield used: ${ethers.formatEther(task.yieldUsed)} ETH`);
      if (task.result) {
        console.log(`  Filecoin CID: ${task.result}`);
      }
      console.log("");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
