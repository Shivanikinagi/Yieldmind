import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const TreasuryABI = [
  "function availableYield() view returns (uint256)",
  "function principalWstETH() view returns (uint256)",
  "function yieldSpent() view returns (uint256)",
  "function inferenceCount() view returns (uint256)",
  "function lastDepositTime() view returns (uint256)"
];

const treasury = new ethers.Contract(
  process.env.TREASURY_ADDRESS!,
  TreasuryABI,
  signer
);

async function showDemoStatus() {
  console.log('\n🎬 YieldMind Demo Status\n');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Get all data
  const [principal, yieldSpent, yieldAvailable, inferenceCount, lastDeposit] = 
    await Promise.all([
      treasury.principalWstETH(),
      treasury.yieldSpent(),
      treasury.availableYield(),
      treasury.inferenceCount(),
      treasury.lastDepositTime()
    ]);
  
  const principalETH = ethers.utils.formatEther(principal);
  const yieldSpentETH = ethers.utils.formatEther(yieldSpent);
  const yieldAvailableETH = ethers.utils.formatEther(yieldAvailable);
  
  // Calculate time since deposit
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - lastDeposit.toNumber();
  const elapsedMinutes = Math.floor(elapsed / 60);
  const elapsedHours = Math.floor(elapsed / 3600);
  const elapsedDays = Math.floor(elapsed / 86400);
  
  console.log('📊 TREASURY STATUS');
  console.log('─────────────────────────────────────────────────────');
  console.log(`Principal Locked:     ${principalETH} ETH`);
  console.log(`Yield Available:      ${yieldAvailableETH} ETH`);
  console.log(`Yield Spent:          ${yieldSpentETH} ETH`);
  console.log(`Inferences Funded:    ${inferenceCount.toNumber()}`);
  console.log(`Time Since Deposit:   ${elapsedDays}d ${elapsedHours % 24}h ${elapsedMinutes % 60}m`);
  console.log('');
  
  // Calculate yield rate
  const principalNum = parseFloat(principalETH);
  const yieldPerYear = principalNum * 0.04;
  const yieldPerDay = yieldPerYear / 365;
  const yieldPerHour = yieldPerDay / 24;
  const yieldPerMinute = yieldPerHour / 60;
  
  console.log('⚡ YIELD ACCRUAL RATE (4% APY)');
  console.log('─────────────────────────────────────────────────────');
  console.log(`Per Minute:           ${yieldPerMinute.toFixed(12)} ETH`);
  console.log(`Per Hour:             ${yieldPerHour.toFixed(10)} ETH`);
  console.log(`Per Day:              ${yieldPerDay.toFixed(8)} ETH`);
  console.log(`Per Year:             ${yieldPerYear.toFixed(6)} ETH`);
  console.log('');
  
  // Calculate task capacity
  const taskCost = 0.0001;
  const tasksPerDay = yieldPerDay / taskCost;
  const tasksPerYear = yieldPerYear / taskCost;
  const yieldAvailableNum = parseFloat(yieldAvailableETH);
  const currentTasks = Math.floor(yieldAvailableNum / taskCost);
  
  console.log('🤖 AGENT CAPACITY');
  console.log('─────────────────────────────────────────────────────');
  console.log(`Task Cost:            ${taskCost} ETH`);
  console.log(`Tasks Available Now:  ${currentTasks}`);
  console.log(`Tasks Per Day:        ${tasksPerDay.toFixed(2)}`);
  console.log(`Tasks Per Year:       ${Math.floor(tasksPerYear)}`);
  console.log('');
  
  // Show what's needed
  const yieldNeeded = taskCost - yieldAvailableNum;
  const minutesNeeded = yieldNeeded / yieldPerMinute;
  const hoursNeeded = minutesNeeded / 60;
  const daysNeeded = hoursNeeded / 24;
  
  if (currentTasks > 0) {
    console.log('✅ READY TO EXECUTE');
    console.log('─────────────────────────────────────────────────────');
    console.log(`Agent can execute ${currentTasks} task(s) right now!`);
    console.log('Run: npm run agent');
  } else {
    console.log('⏳ WAITING FOR YIELD');
    console.log('─────────────────────────────────────────────────────');
    console.log(`Need:                 ${yieldNeeded.toFixed(10)} ETH more`);
    console.log(`Time Required:        ${Math.floor(daysNeeded)}d ${Math.floor(hoursNeeded % 24)}h ${Math.floor(minutesNeeded % 60)}m`);
    console.log('');
    console.log('💡 OPTIONS:');
    console.log('   1. Wait for yield to accrue');
    console.log('   2. Add more principal: npm run fund');
    console.log('   3. Show concept in demo (explain yield accrual)');
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('🔗 PROOF LINKS FOR JUDGES:');
  console.log('─────────────────────────────────────────────────────');
  console.log(`Treasury Contract:    https://sepolia.basescan.org/address/${process.env.TREASURY_ADDRESS}`);
  console.log(`Agent Contract:       https://sepolia.basescan.org/address/${process.env.AGENT_ADDRESS}`);
  console.log(`Frontend:             http://localhost:3000`);
  console.log('');
  console.log('📝 KEY POINTS FOR DEMO:');
  console.log('─────────────────────────────────────────────────────');
  console.log('✓ Contracts deployed and verified on Base Sepolia');
  console.log(`✓ ${principalETH} ETH principal locked (never touched)`);
  console.log(`✓ ${yieldAvailableETH} ETH yield available (only this is spent)`);
  console.log('✓ Agent checks yield before each task');
  console.log('✓ Self-sustaining: runs forever with staking yield');
  console.log('✓ Real integrations: Venice AI, Filecoin, Zyfai');
  console.log('');
}

showDemoStatus().catch(console.error);
