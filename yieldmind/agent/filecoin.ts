import { create } from '@web3-storage/w3up-client';
import * as dotenv from 'dotenv';
dotenv.config();

let client: any = null;
let isAuthenticated = false;

async function getClient() {
  if (!client) {
    client = await create();
    
    // Authenticate with email if not already done
    if (!isAuthenticated && process.env.FILECOIN_W3UP_EMAIL) {
      try {
        console.log('   Authenticating with web3.storage...');
        await client.login(process.env.FILECOIN_W3UP_EMAIL);
        
        // List available spaces
        const spaces = await client.spaces();
        if (spaces.length > 0) {
          await client.setCurrentSpace(spaces[0].did());
          isAuthenticated = true;
          console.log('   ✓ Connected to web3.storage space');
        } else {
          console.log('   ⚠️  No spaces found. Creating one...');
          const space = await client.createSpace('yieldmind');
          await client.setCurrentSpace(space.did());
          isAuthenticated = true;
          console.log('   ✓ Created and connected to new space');
        }
      } catch (error: any) {
        console.error('   ⚠️  web3.storage auth failed:', error.message);
        console.log('   Falling back to mock mode');
      }
    }
  }
  return client;
}

export async function logToFilecoin(record: {
  taskId: number;
  prompt: string;
  response: string;
  yieldUsed: string;
  txHash: string;
  timestamp: string;
}): Promise<string> {
  const c = await getClient();
  
  if (!isAuthenticated) {
    throw new Error('Not authenticated with web3.storage - check FILECOIN_W3UP_EMAIL in .env');
  }
  
  const blob = new Blob(
    [JSON.stringify(record, null, 2)],
    { type: 'application/json' }
  );
  const file = new File([blob], `yieldmind-task-${record.taskId}.json`);
  const cid = await c.uploadFile(file);
  
  console.log(`   ✓ Logged to Filecoin: ${cid.toString()}`);
  console.log(`   View at: https://w3s.link/ipfs/${cid.toString()}`);
  return cid.toString();
}
