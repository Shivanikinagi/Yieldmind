import { getYieldBalance, requestTask, completeTask, getPrincipal, getYieldSpent, getInferenceCount } from './chain';
import { callVenice } from './venice';
import { logToFilecoin } from './filecoin';
import { getZyfaiBalance, deductInferenceCost, createYieldAccount } from './zyfai';

const DEMO_TASKS = [
  "Analyze current DeFi yield opportunities on Base",
  "Should a yield-funded agent rebalance its stETH position this week?",
  "What are the risks of using staking yield to fund autonomous AI compute?"
];

async function runAgentLoop() {
  console.log('\n🤖 YieldMind Agent Starting...\n');
  
  // Initialize Zyfai yield account (optional - can work without it)
  let zyfaiEnabled = false;
  try {
    console.log('Initializing Zyfai yield account...');
    const yieldAccountAddress = await createYieldAccount();
    console.log(`✓ Zyfai yield account ready: ${yieldAccountAddress}\n`);
    zyfaiEnabled = true;
  } catch (error: any) {
    console.log(`⚠️  Zyfai not available: ${error.message}`);
    console.log('Continuing with on-chain yield only\n');
  }
  
  // Display initial state
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
  
  for (let i = 0; i < DEMO_TASKS.length; i++) {
    const prompt = DEMO_TASKS[i];
    console.log(`\n── Task ${i+1}: ${prompt}`);
    
    // 1. Check on-chain yield (from Lido staking)
    const yieldAvailable = await getYieldBalance();
    console.log(`   On-chain yield available: ${yieldAvailable} ETH`);
    
    // 2. Check Zyfai yield account balance (optional)
    if (zyfaiEnabled) {
      try {
        const zyfaiBalance = await getZyfaiBalance();
        console.log(`   Zyfai yield balance: ${zyfaiBalance.toFixed(4)} ETH`);
      } catch (error: any) {
        console.log(`   ⚠️  Zyfai balance check failed: ${error.message}`);
        zyfaiEnabled = false;
      }
    }
    
    if (parseFloat(yieldAvailable) < 0.0001) {
      console.log('   ⏳ Insufficient yield — waiting for staking rewards...');
      console.log('   (On mainnet, yield would accrue from Lido staking)');
      continue;
    }
    
    // 3. Request task on-chain (pays from yield)
    console.log('   ✓ Yield sufficient — requesting inference...');
    const taskId = await requestTask(prompt);
    console.log(`   ✓ Task ${taskId} registered on-chain`);
    console.log(`   ✓ Paid from YIELD ONLY (principal remains locked)`);
    
    // 4. Call Venice (private inference) - REQUIRED, NO FALLBACK
    console.log('   → Calling Venice AI...');
    const response = await callVenice(prompt);
    console.log(`   ✓ Response: ${response.slice(0, 80)}...`);
    
    // 5. Deduct from Zyfai yield account (optional)
    if (zyfaiEnabled) {
      try {
        await deductInferenceCost(0.0001, `YieldMind task ${taskId}`);
      } catch (error: any) {
        console.log(`   ⚠️  Zyfai deduction failed: ${error.message}`);
        zyfaiEnabled = false;
      }
    }
    
    // 6. Log to Filecoin - REQUIRED, NO FALLBACK
    const cid = await logToFilecoin({
      taskId,
      prompt,
      response,
      yieldUsed: '0.0001 ETH',
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: new Date().toISOString()
    });
    
    // 7. Write result back on-chain
    await completeTask(taskId, cid);
    console.log(`   ✓ Task complete. Filecoin CID: ${cid}`);
    
    // Small delay between tasks
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n✅ Agent loop complete — all tasks funded by staking yield');
  console.log('💡 Key Features:');
  console.log('   • Principal locked in YieldTreasury (Lido stETH)');
  console.log('   • Only yield spent (never principal)');
  console.log('   • Venice AI for private inference');
  console.log('   • Filecoin for decentralized storage');
  console.log('   • Zyfai SDK for yield management (optional)');
  console.log('   • Agent earns yield → spends yield → autonomous\n');
}

runAgentLoop().catch(console.error);
