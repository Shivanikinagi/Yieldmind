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

export async function requestTask(prompt: string): Promise<number> {
  const tx = await agent.requestTask(prompt);
  const receipt = await tx.wait();
  
  // Parse event to get task ID
  const event = receipt?.events?.find((e: any) => e.event === 'TaskRequested');
  return event ? Number(event.args[0]) : 0;
}

export async function completeTask(taskId: number, cid: string) {
  const tx = await agent.completeTask(taskId, cid);
  await tx.wait();
}

export async function getTaskCount(): Promise<number> {
  const count = await agent.taskCount();
  return Number(count);
}
