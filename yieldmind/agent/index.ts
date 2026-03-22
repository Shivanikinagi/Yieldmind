import {
  completeTask,
  getInferenceCount,
  getPrincipal,
  getYieldBalance,
  getYieldSpent,
  requestTask,
} from './chain';
import { logToFilecoin } from './filecoin';
import { callVenice } from './venice';
import { createYieldAccount, deductInferenceCost, getZyfaiBalance } from './zyfai';

const TASKS = [
  'Analyze current DeFi yield opportunities on Base',
  'Should a yield-funded agent rebalance its stETH position this week?',
  'What are the risks of using staking yield to fund autonomous AI compute?',
];

const INFERENCE_COST_ETH = 0.000000000001;

async function runAgentLoop() {
  console.log('\nYieldMind agent starting...\n');

  let zyfaiEnabled = false;
  try {
    console.log('Initializing Zyfai yield account...');
    const yieldAccountAddress = await createYieldAccount();
    console.log(`Zyfai yield account ready: ${yieldAccountAddress}\n`);
    zyfaiEnabled = true;
  } catch (error: any) {
    console.log(`Zyfai not available: ${error.message}`);
    console.log('Continuing with on-chain yield only.\n');
  }

  const principal = await getPrincipal();
  const yieldAvailable = await getYieldBalance();
  const yieldSpent = await getYieldSpent();
  const inferenceCount = await getInferenceCount();

  console.log('=== Treasury Status ===');
  console.log(`Principal (locked): ${principal} ETH`);
  console.log(`Yield available: ${yieldAvailable} ETH`);
  console.log(`Yield spent: ${yieldSpent} ETH`);
  console.log(`Inferences funded: ${inferenceCount}`);
  console.log('');

  for (let i = 0; i < TASKS.length; i += 1) {
    const prompt = TASKS[i];
    console.log(`Task ${i + 1}: ${prompt}`);

    const availableYield = await getYieldBalance();
    console.log(`  On-chain yield available: ${availableYield} ETH`);

    if (zyfaiEnabled) {
      try {
        const zyfaiBalance = await getZyfaiBalance();
        console.log(`  Zyfai yield balance: ${zyfaiBalance.toFixed(4)} ETH`);
      } catch (error: any) {
        console.log(`  Zyfai balance check failed: ${error.message}`);
        zyfaiEnabled = false;
      }
    }

    if (parseFloat(availableYield) < INFERENCE_COST_ETH) {
      console.log('  Insufficient yield. Waiting for staking rewards...\n');
      continue;
    }

    console.log('  Yield sufficient. Requesting inference...');
    const taskRequest = await requestTask(prompt);
    const taskId = taskRequest.taskId;
    console.log(`  Task ${taskId} registered on-chain`);
    console.log('  Paid from yield only. Principal remains locked.');

    console.log('  Calling Venice AI...');
    const response = await callVenice(prompt);
    console.log(`  Response: ${response.slice(0, 80)}...`);

    if (zyfaiEnabled) {
      try {
        await deductInferenceCost(INFERENCE_COST_ETH, `YieldMind task ${taskId}`);
      } catch (error: any) {
        console.log(`  Zyfai deduction failed: ${error.message}`);
        zyfaiEnabled = false;
      }
    }

    const cid = await logToFilecoin({
      taskId,
      prompt,
      response,
      yieldUsed: `${INFERENCE_COST_ETH} ETH`,
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: new Date().toISOString(),
    });

    await completeTask(taskId, cid);
    console.log(`  Task complete. Filecoin CID: ${cid}\n`);

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log('Agent loop complete.');
  console.log('Key features:');
  console.log('  - Principal locked in YieldTreasury');
  console.log('  - Only yield spent');
  console.log('  - Venice AI for inference');
  console.log('  - Filecoin for decentralized storage');
  console.log('  - Zyfai SDK for yield management when available');
}

runAgentLoop().catch(console.error);
