import { ethers } from 'hardhat';

async function main() {
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  const agentAddress = process.env.AGENT_ADDRESS;

  if (!treasuryAddress || !agentAddress) {
    throw new Error('Contract addresses not set in .env');
  }

  console.log('=== YieldMind Status ===\n');

  const treasury = await ethers.getContractAt('YieldTreasury', treasuryAddress);
  const agent = await ethers.getContractAt('YieldMindAgent', agentAddress);

  const principal = await treasury.principalWstETH();
  const yieldAvailable = await treasury.availableYield();
  const yieldSpent = await treasury.yieldSpent();
  const inferenceCount = await treasury.inferenceCount();
  const owner = await treasury.owner();
  const agentAddr = await treasury.agent();

  console.log('Treasury:', treasuryAddress);
  console.log('Owner:', owner);
  console.log('Agent:', agentAddr);
  console.log('');
  console.log('Principal (locked):', ethers.utils.formatEther(principal), 'ETH');
  console.log('Yield available:', ethers.utils.formatEther(yieldAvailable), 'ETH');
  console.log('Yield spent:', ethers.utils.formatEther(yieldSpent), 'ETH');
  console.log('Inferences funded:', inferenceCount.toString());
  console.log('');

  const taskCount = await agent.taskCount();
  const taskCountNumber = taskCount.toNumber();
  console.log('Agent:', agentAddress);
  console.log('Total tasks:', taskCountNumber.toString());
  console.log('');

  if (taskCountNumber > 0) {
    console.log('=== Recent Tasks ===\n');
    const start = taskCountNumber > 3 ? taskCountNumber - 2 : 1;

    for (let i = start; i <= taskCountNumber; i += 1) {
      const task = await agent.tasks(i);
      console.log(`Task #${i}:`);
      console.log(`  Prompt: ${task.prompt.slice(0, 60)}...`);
      console.log(`  Completed: ${task.completed}`);
      console.log(`  Yield used: ${ethers.utils.formatEther(task.yieldUsed)} ETH`);
      if (task.result) {
        console.log(`  Filecoin CID: ${task.result}`);
      }
      console.log('');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
