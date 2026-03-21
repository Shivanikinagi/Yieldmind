import { ZyfaiSDK } from '@zyfai/sdk';
import { createWalletClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
dotenv.config();

let zyfaiSDK: ZyfaiSDK | null = null;
let smartWalletAddress: string | null = null;

async function getZyfaiSDK(): Promise<ZyfaiSDK> {
  if (!zyfaiSDK) {
    // Initialize Zyfai SDK
    // Note: Zyfai SDK requires an API key from their platform
    // For demo purposes, we'll handle the case where it's not available
    
    try {
      zyfaiSDK = new ZyfaiSDK({
        apiKey: process.env.ZYFAI_API_KEY || 'demo-key',
        rpcUrls: {
          8453: process.env.BASE_SEPOLIA_RPC, // Base
        },
      });
      
      console.log('✓ Connected to Zyfai SDK');
    } catch (error) {
      console.log('⚠️  Zyfai SDK initialization failed, using mock mode');
      throw error;
    }
  }
  return zyfaiSDK;
}

export async function getZyfaiBalance(): Promise<number> {
  try {
    const sdk = await getZyfaiSDK();
    
    // Get smart wallet address if not already created
    if (!smartWalletAddress) {
      // In production, you would deploy a Safe smart wallet
      // For demo, we'll use mock data
      throw new Error('Smart wallet not deployed');
    }
    
    // Get portfolio/balance from Zyfai
    // const portfolio = await sdk.getPortfolio(smartWalletAddress);
    // return parseFloat(portfolio.totalValue);
    
    return 0.0050; // Mock balance
  } catch (error) {
    console.log('   [Mock] Zyfai balance check (SDK unavailable)');
    return 0.0050; // Mock balance for demo
  }
}

export async function deductInferenceCost(
  amount: number,
  description: string
): Promise<void> {
  try {
    const sdk = await getZyfaiSDK();
    
    if (!smartWalletAddress) {
      throw new Error('Smart wallet not deployed');
    }
    
    // In production, you would withdraw from the smart wallet
    // const tx = await sdk.withdraw({
    //   amount: parseEther(amount.toString()),
    //   to: process.env.VENICE_PAYMENT_ADDRESS,
    // });
    
    console.log(`   [Mock] Deducted ${amount} ETH from Zyfai (SDK unavailable)`);
  } catch (error) {
    console.log(`   [Mock] Deducted ${amount} ETH from Zyfai (SDK unavailable)`);
  }
}

export async function createYieldAccount(): Promise<string> {
  try {
    const sdk = await getZyfaiSDK();
    
    // Create account from private key
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    
    // Deploy Safe smart wallet via Zyfai
    // const result = await sdk.deploySafe(account.address);
    // smartWalletAddress = result.safeAddress;
    
    // For demo, use EOA address
    smartWalletAddress = account.address;
    
    console.log(`✓ Zyfai smart wallet: ${smartWalletAddress}`);
    return smartWalletAddress;
  } catch (error) {
    console.log('⚠️  Zyfai smart wallet deployment failed');
    console.log('   Using mock mode for demo');
    
    // Use EOA as fallback
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    smartWalletAddress = account.address;
    return smartWalletAddress;
  }
}
