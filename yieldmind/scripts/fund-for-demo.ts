import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const TreasuryABI = [
  "function deposit() payable",
  "function principalWstETH() view returns (uint256)",
  "function availableYield() view returns (uint256)"
];

const treasury = new ethers.Contract(
  process.env.TREASURY_ADDRESS!,
  TreasuryABI,
  signer
);

async function fundForDemo() {
  console.log('\n💰 Funding Treasury for Demo\n');
  
  // Check current balance
  const balance = await signer.getBalance();
  console.log(`Your balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  // Check current principal
  const currentPrincipal = await treasury.principalWstETH();
  console.log(`Current principal: ${ethers.utils.formatEther(currentPrincipal)} ETH`);
  
  // Calculate how much to add for immediate task execution
  // Need 0.0001 ETH yield, at 4% APY that requires 0.0001 / 0.04 = 0.0025 ETH principal
  // But to be safe and show multiple tasks, let's add 0.1 ETH
  const amountToAdd = '0.1';
  
  console.log(`\nAdding ${amountToAdd} ETH to treasury...`);
  console.log('This will enable immediate task execution!\n');
  
  try {
    const tx = await treasury.deposit({
      value: ethers.utils.parseEther(amountToAdd)
    });
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log('Waiting for confirmation...\n');
    
    await tx.wait();
    
    console.log('✅ Deposit successful!\n');
    
    // Check new state
    const newPrincipal = await treasury.principalWstETH();
    const yieldAvailable = await treasury.availableYield();
    
    console.log('📊 New Treasury State:');
    console.log(`Principal: ${ethers.utils.formatEther(newPrincipal)} ETH`);
    console.log(`Yield available: ${ethers.utils.formatEther(yieldAvailable)} ETH`);
    
    const yieldNum = parseFloat(ethers.utils.formatEther(yieldAvailable));
    const tasksAvailable = Math.floor(yieldNum / 0.0001);
    
    console.log(`\n🤖 Agent can now execute ${tasksAvailable} tasks!`);
    console.log('\nRun: npm run agent\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

fundForDemo().catch(console.error);
