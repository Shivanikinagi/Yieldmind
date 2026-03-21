import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { getYieldBalance, getPrincipal, getYieldSpent, getInferenceCount, requestTask, completeTask } from '../agent/chain';
import { callVenice } from '../agent/venice';
import { logToFilecoin } from '../agent/filecoin';
import { getZyfaiBalance, deductInferenceCost } from '../agent/zyfai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Status endpoint - polled by frontend
app.get('/status', async (req, res) => {
  try {
    const [principal, yieldAvailable, yieldSpent, inferenceCount, zyfaiBalance] = await Promise.all([
      getPrincipal(),
      getYieldBalance(),
      getYieldSpent(),
      getInferenceCount(),
      getZyfaiBalance()
    ]);
    
    res.json({
      principal,
      yieldAvailable,
      yieldSpent,
      inferenceCount,
      zyfaiBalance
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Run task endpoint
app.post('/run-task', async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }
  
  try {
    // 1. Check yield
    const yieldAvailable = await getYieldBalance();
    const zyfaiBalance = await getZyfaiBalance();
    
    if (parseFloat(yieldAvailable) < 0.0001 && zyfaiBalance < 0.001) {
      return res.status(400).json({ error: 'Insufficient yield' });
    }
    
    // 2. Request task on-chain
    const taskId = await requestTask(prompt);
    
    // 3. Call Venice
    const response = await callVenice(prompt);
    
    // 4. Deduct from Zyfai
    await deductInferenceCost(0.001, `YieldMind task ${taskId}`);
    
    // 5. Log to Filecoin
    const cid = await logToFilecoin({
      taskId,
      prompt,
      response,
      yieldUsed: '0.0001 ETH',
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: new Date().toISOString()
    });
    
    // 6. Complete task on-chain
    await completeTask(taskId, cid);
    
    res.json({
      taskId,
      response,
      cid,
      yieldUsed: '0.0001 ETH'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 YieldMind backend running on port ${PORT}`);
});
