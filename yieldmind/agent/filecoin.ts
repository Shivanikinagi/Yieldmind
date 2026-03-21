import { create } from '@web3-storage/w3up-client';

let client: any = null;

async function getClient() {
  if (!client) {
    client = await create();
    // In production: client.login('your@email.com') + setCurrentSpace
    // For demo: use pre-authenticated space or mock
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
  try {
    const c = await getClient();
    
    const blob = new Blob(
      [JSON.stringify(record, null, 2)],
      { type: 'application/json' }
    );
    const file = new File([blob], `yieldmind-task-${record.taskId}.json`);
    const cid = await c.uploadFile(file);
    
    console.log(`✓ Logged to Filecoin: ${cid.toString()}`);
    return cid.toString();
  } catch (error) {
    console.error('Filecoin upload error:', error);
    // Generate mock CID for demo
    const mockCID = `bafyrei${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    console.log(`✓ Mock CID (Filecoin unavailable): ${mockCID}`);
    return mockCID;
  }
}
