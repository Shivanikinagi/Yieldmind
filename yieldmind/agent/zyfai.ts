import { ZyfaiSDK } from '@zyfai/sdk';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
dotenv.config();

let zyfaiSDK: ZyfaiSDK | null = null;
let smartWalletAddress: string | null = null;

async function getZyfaiSDK(): Promise<ZyfaiSDK> {
  if (!zyfaiSDK) {
    if (!process.env.ZYFAI_API_KEY) {
      throw new Error('ZYFAI_API_KEY not set in .env');
    }
    
    try {
      zyfaiSDK = new ZyfaiSDK({
        apiKey: process.env.ZYFAI_API_KEY,
        rpcUrls: {
          8453: process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
        },
      });
      
      console.log('✓ Connected to Zyfai SDK');
    } catch (error: any) {
      console.error('❌ Zyfai SDK initialization failed:', error.message);
      throw error;
    }
  }
  return zyfaiSDK;
}

export async function getZyfaiBalance(): Promise<number> {
  const sdk = await getZyfaiSDK();
  
  // Get smart wallet address if not already created
  if (!smartWalletAddress) {
    const privateKey = process.env.PRIVATE_KEY!;
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const account = privateKeyToAccount(formattedKey as `0x${string}`);
    smartWalletAddress = account.address;
  }
  
  // Query actual balance from Zyfai SDK
  // Note: Adjust method based on actual Zyfai SDK documentation
  throw new Error('Zyfai SDK balance query not yet implemented - check Zyfai documentation for correct method');
}

export async function deductInferenceCost(
  amount: number,
  description: string
): Promise<void> {
  const sdk = await getZyfaiSDK();
  
  if (!smartWalletAddress) {
    throw new Error('Smart wallet not initialized');
  }
  
  // Deduct from Zyfai yield account using actual SDK method
  // Note: Adjust method based on actual Zyfai SDK documentation
  throw new Error('Zyfai SDK deduction not yet implemented - check Zyfai documentation for correct method');
}

export async function createYieldAccount(): Promise<string> {
  try {
    const sdk = await getZyfaiSDK();
    
    // Create account from private key
    const privateKey = process.env.PRIVATE_KEY!;
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const account = privateKeyToAccount(formattedKey as `0x${string}`);
    smartWalletAddress = account.address;
    
    console.log(`✓ Zyfai account initialized: ${smartWalletAddress}`);
    return smartWalletAddress;
  } catch (error: any) {
    console.error('❌ Zyfai account creation failed:', error.message);
    throw error;
  }
}
