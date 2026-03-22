import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// ABIs - paste after compilation
const TreasuryABI = [
  "function availableYield() view returns (uint256)",
  "function payForInference(uint256 amount, string provider, uint256 inferenceId) external",
  "function deposit() payable",
  "function principalWstETH() view returns (uint256)",
  "function yieldSpent() view returns (uint256)",
  "function inferenceCount() view returns (uint256)",
  "event InferencePaid(uint256 amount, string provider, uint256 inferenceId)"
];

const AgentABI = [
  "function requestTask(string prompt) returns (uint256)",
  "function completeTask(uint256 taskId, string filecoinCID)",
  "function taskCount() view returns (uint256)",
  "function INFERENCE_COST() view returns (uint256)",
  "function tasks(uint256) view returns (uint256 id, string prompt, string result, uint256 yieldUsed, uint256 timestamp, bool completed)",
  "event TaskRequested(uint256 indexed id, string prompt)",
  "event TaskCompleted(uint256 indexed id, string filecoinCID, uint256 yieldUsed)",
  "event InsufficientYield(uint256 available, uint256 required)"
];

export const treasury = new ethers.Contract(
  process.env.TREASURY_ADDRESS!,
  TreasuryABI,
  signer
);

export const agent = new ethers.Contract(
  process.env.AGENT_ADDRESS!,
  AgentABI,
  signer
);

export async function getYieldBalance(): Promise<string> {
  const raw = await treasury.availableYield();
  return ethers.utils.formatEther(raw);
}

export async function getPrincipal(): Promise<string> {
  const raw = await treasury.principalWstETH();
  return ethers.utils.formatEther(raw);
}

export async function getYieldSpent(): Promise<string> {
  const raw = await treasury.yieldSpent();
  return ethers.utils.formatEther(raw);
}

export async function getInferenceCount(): Promise<number> {
  const count = await treasury.inferenceCount();
  return Number(count);
}

export async function requestTask(prompt: string): Promise<{ taskId: number; txHash: string }> {
  const tx = await agent.requestTask(prompt);
  const receipt = await tx.wait();
  
  // Parse event to get task ID
  const event = receipt?.events?.find((e: any) => e.event === 'TaskRequested');
  return {
    taskId: event ? Number(event.args[0]) : 0,
    txHash: tx.hash,
  };
}

export async function completeTask(taskId: number, cid: string): Promise<{ txHash: string }> {
  const tx = await agent.completeTask(taskId, cid);
  await tx.wait();
  return { txHash: tx.hash };
}

export async function getTaskCount(): Promise<number> {
  const count = await agent.taskCount();
  return Number(count);
}

export async function getInferenceCost(): Promise<string> {
  const raw = await agent.INFERENCE_COST();
  return ethers.utils.formatEther(raw);
}

export interface ChainTask {
  id: number;
  prompt: string;
  result: string;
  yieldUsed: string;
  timestamp: string;
  timestampMs: number;
  completed: boolean;
}

export async function getTasks(limit = 20): Promise<ChainTask[]> {
  const count = await getTaskCount();

  if (count === 0) {
    return [];
  }

  const start = Math.max(1, count - limit + 1);
  const taskPromises: Array<Promise<any>> = [];

  for (let id = start; id <= count; id++) {
    taskPromises.push(agent.tasks(id));
  }

  const taskData = await Promise.all(taskPromises);

  return taskData
    .map((task: any) => {
      const timestampMs = Number(task.timestamp) * 1000;

      return {
        id: Number(task.id),
        prompt: task.prompt,
        result: task.result,
        yieldUsed: ethers.utils.formatEther(task.yieldUsed),
        timestamp: new Date(timestampMs).toISOString(),
        timestampMs,
        completed: task.completed,
      };
    })
    .sort((a, b) => b.id - a.id);
}
