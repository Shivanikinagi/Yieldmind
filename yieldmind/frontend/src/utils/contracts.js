export const TREASURY_ADDRESS = '0x28b1Ea8f2De5f6aa3af8271E15D2bef15F17BB43';
export const AGENT_ADDRESS = '0x20E465f74586adCE1ABcFE512A540Bac6a91AB4C';

export const TREASURY_ABI = [
  "function availableYield() view returns (uint256)",
  "function payForInference(uint256 amount, string provider, uint256 inferenceId) external",
  "function deposit() payable",
  "function principalWstETH() view returns (uint256)",
  "function yieldSpent() view returns (uint256)",
  "function inferenceCount() view returns (uint256)",
  "function lastDepositTime() view returns (uint256)",
  "event Deposited(address indexed user, uint256 ethAmount, uint256 wstETHReceived)",
  "event InferencePaid(uint256 amount, string provider, uint256 inferenceId)",
  "event YieldWithdrawn(address indexed to, uint256 amount)"
];

export const AGENT_ABI = [
  "function requestTask(string prompt) returns (uint256)",
  "function completeTask(uint256 taskId, string filecoinCID)",
  "function taskCount() view returns (uint256)",
  "function tasks(uint256) view returns (uint256 id, string prompt, string result, uint256 yieldUsed, uint256 timestamp, bool completed)",
  "function INFERENCE_COST() view returns (uint256)",
  "event TaskRequested(uint256 indexed id, string prompt)",
  "event TaskCompleted(uint256 indexed id, string filecoinCID, uint256 yieldUsed)",
  "event InsufficientYield(uint256 available, uint256 required)"
];
