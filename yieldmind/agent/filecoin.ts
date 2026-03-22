import { create } from '@web3-storage/w3up-client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config();

let client: any = null;
let isAuthenticated = false;

const REAL_FILECOIN_MODE = process.env.YIELDMIND_REAL_FILECOIN === 'true';
const LOCAL_PROOF_DIR = path.join(__dirname, '..', 'server', 'data', 'local-proof');

function createLocalProof(record: {
  taskId: number;
  prompt: string;
  response: string;
  yieldUsed: string;
  txHash: string;
  timestamp: string;
}): string {
  fs.mkdirSync(LOCAL_PROOF_DIR, { recursive: true });
  const proofId = `local-proof-${record.taskId || Date.now()}`;
  const proofPath = path.join(LOCAL_PROOF_DIR, `${proofId}.json`);
  fs.writeFileSync(proofPath, JSON.stringify(record, null, 2));
  console.log(`   ✓ Stored local proof record: ${proofId}`);
  return proofId;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function getClient() {
  if (!client) {
    client = await withTimeout(create(), 5000, 'web3.storage client init');

    if (!isAuthenticated && process.env.FILECOIN_W3UP_EMAIL) {
      try {
        console.log('   Authenticating with web3.storage...');
        await withTimeout(client.login(process.env.FILECOIN_W3UP_EMAIL), 8000, 'web3.storage login');

        const spaces: any[] = (await withTimeout(client.spaces(), 5000, 'web3.storage spaces lookup')) as any[];
        if (spaces.length > 0) {
          await withTimeout(client.setCurrentSpace(spaces[0].did()), 5000, 'web3.storage setCurrentSpace');
          isAuthenticated = true;
          console.log('   ✓ Connected to web3.storage space');
        } else {
          const space: any = await withTimeout(client.createSpace('yieldmind'), 8000, 'web3.storage createSpace');
          await withTimeout(client.setCurrentSpace(space.did()), 5000, 'web3.storage setCurrentSpace');
          isAuthenticated = true;
          console.log('   ✓ Created and connected to new space');
        }
      } catch (error: any) {
        console.error('   ⚠️  web3.storage auth failed:', error.message);
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
  if (!REAL_FILECOIN_MODE) {
    return createLocalProof(record);
  }

  try {
    const c = await getClient();

    if (!isAuthenticated) {
      return createLocalProof(record);
    }

    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const file = new File([blob], `yieldmind-task-${record.taskId}.json`);
    const cid: any = await withTimeout(c.uploadFile(file), 10000, 'web3.storage upload');

    console.log(`   ✓ Logged to Filecoin: ${cid.toString()}`);
    console.log(`   View at: https://w3s.link/ipfs/${cid.toString()}`);
    return cid.toString();
  } catch (error: any) {
    console.error('   ⚠️  Filecoin upload failed, falling back to local proof:', error.message);
    return createLocalProof(record);
  }
}
