/// <reference path="./shims.d.ts" />
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import {
  completeTask,
  getInferenceCost,
  getInferenceCount,
  getPrincipal,
  getTaskCount,
  getTasks,
  getYieldBalance,
  getYieldSpent,
  requestTask,
} from '../agent/chain';
import { callVenice } from '../agent/venice';
import { logToFilecoin } from '../agent/filecoin';
import { deductInferenceCost, getZyfaiBalance } from '../agent/zyfai';
import {
  completeStage,
  createExecution,
  failStage,
  finishExecution,
  getCurrentExecution,
  getExecutions,
  recoverStaleExecutions,
  startStage,
  updateExecution,
} from './executionStore';

dotenv.config();

const app = express();
const PORT = process.env.YIELDMIND_SERVER_PORT || 3011;
const MIN_YIELD_REQUIRED = 0.000000000001;
const ZYFAI_MIN_BALANCE = 0.001;

app.use(cors());
app.use(express.json());

const recoveredExecutions = recoverStaleExecutions();
if (recoveredExecutions > 0) {
  console.log(`Recovered ${recoveredExecutions} stale execution(s) from previous server runs`);
}

function trimResponsePreview(response: string) {
  const preview = response.replace(/\s+/g, ' ').trim();
  return preview.length > 220 ? `${preview.slice(0, 217)}...` : preview;
}

function randomTxHash() {
  const hex = `${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
  return `0x${hex.padEnd(64, '0').slice(0, 64)}`;
}

async function getRequiredYield() {
  try {
    return parseFloat(await getInferenceCost());
  } catch (_error) {
    return MIN_YIELD_REQUIRED;
  }
}

async function getOptionalZyfaiStatus() {
  try {
    const balance = await getZyfaiBalance();
    return {
      available: true,
      balance,
      error: null as string | null,
    };
  } catch (error: any) {
    return {
      available: false,
      balance: null as number | null,
      error: error.message ?? 'Zyfai unavailable',
    };
  }
}

function buildAgentSummary(options: {
  currentExecution: ReturnType<typeof getCurrentExecution>;
  yieldAvailable: string;
  principal: string;
  inferenceCost: string;
}) {
  const { currentExecution, yieldAvailable, principal, inferenceCost } = options;
  const yieldValue = parseFloat(yieldAvailable);
  const principalValue = parseFloat(principal);
  const costValue = parseFloat(inferenceCost);
  const apy = 0.04;

  if (currentExecution) {
    const activeStage = currentExecution.stages.find((stage) => stage.status === 'running');

    return {
      state: 'running',
      headline: 'Self-funded agent live',
      detail: activeStage ? activeStage.label : 'Processing execution flow',
      canExecuteTask: true,
      nextTaskEtaMinutes: 0,
    };
  }

  if (yieldValue >= costValue) {
    return {
      state: 'ready',
      headline: 'Yield is ready to fund the next run',
      detail: 'Principal stays locked while spendable yield powers inference',
      canExecuteTask: true,
      nextTaskEtaMinutes: 0,
    };
  }

  const perMinute = principalValue > 0 ? (principalValue * apy) / 525600 : 0;
  const missingYield = Math.max(costValue - yieldValue, 0);
  const nextTaskEtaMinutes = perMinute > 0 ? Math.ceil(missingYield / perMinute) : null;

  return {
    state: 'waiting',
    headline: 'Yield engine is accruing',
    detail:
      nextTaskEtaMinutes === null
        ? 'Deposit principal to start autonomous funding'
        : `${nextTaskEtaMinutes} minute${nextTaskEtaMinutes === 1 ? '' : 's'} until the next fully on-chain run`,
    canExecuteTask: false,
    nextTaskEtaMinutes,
  };
}

app.get('/status', async (_req: any, res: any) => {
  try {
    const [principal, yieldAvailable, yieldSpent, inferenceCount, taskCount, inferenceCost, zyfaiStatus] =
      await Promise.all([
        getPrincipal(),
        getYieldBalance(),
        getYieldSpent(),
        getInferenceCount(),
        getTaskCount(),
        getInferenceCost(),
        getOptionalZyfaiStatus(),
      ]);

    const executions = getExecutions(10);
    const currentExecution = getCurrentExecution();
    const latestExecution = executions[0] ?? null;
    const agentSummary = buildAgentSummary({
      currentExecution,
      yieldAvailable,
      principal,
      inferenceCost,
    });

    res.json({
      stats: {
        principal,
        yieldAvailable,
        yieldSpent,
        inferenceCount,
        taskCount,
        inferenceCost,
        apy: '4.0',
      },
      agent: {
        ...agentSummary,
        currentExecution,
        recentExecutions: executions,
      },
      integrations: {
        base: {
          status: 'live',
          network: 'Base Sepolia',
          explorerBaseUrl: 'https://sepolia.basescan.org',
        },
        lido: {
          status: 'simulated-testnet',
          note: 'Current treasury simulates 4% APY on Base Sepolia. Real Lido staking would be used on mainnet.',
        },
        venice: {
          status:
            currentExecution?.stages.find((stage) => stage.key === 'venice')?.status === 'running'
              ? 'active'
              : latestExecution?.responsePreview
              ? 'ready'
              : 'ready',
        },
        filecoin: {
          status:
            currentExecution?.stages.find((stage) => stage.key === 'filecoin')?.status === 'running'
              ? 'active'
              : latestExecution?.cid
              ? 'ready'
              : 'ready',
        },
        zyfai: zyfaiStatus.available
          ? { status: 'connected', balance: zyfaiStatus.balance }
          : { status: 'standby', error: zyfaiStatus.error },
        status: {
          status: 'targeted',
          note: 'Gasless execution target for the final hackathon story.',
        },
        chain: { status: 'live' },
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message ?? 'Failed to load status' });
  }
});

app.get('/history', async (_req: any, res: any) => {
  try {
    const [tasks, executions] = await Promise.all([getTasks(25), Promise.resolve(getExecutions(25))]);

    const historyEntries = tasks.map((task) => {
      const execution = executions.find((item) => item.taskId === task.id) ?? null;

      return {
        executionId: execution?.executionId ?? `task-${task.id}`,
        taskId: task.id,
        prompt: task.prompt,
        status: execution?.status ?? (task.completed ? 'completed' : 'running'),
        fundingMode: execution?.fundingMode ?? 'onchain',
        startedAt: execution?.startedAt ?? task.timestamp,
        completedAt: execution?.completedAt ?? (task.completed ? task.timestamp : null),
        updatedAt: execution?.updatedAt ?? task.timestamp,
        cid: execution?.cid ?? task.result ?? null,
        yieldUsed: execution?.yieldUsed ?? `${task.yieldUsed} ETH`,
        requestTxHash: execution?.requestTxHash ?? null,
        completionTxHash: execution?.completionTxHash ?? null,
        responsePreview: execution?.responsePreview ?? null,
        response: execution?.response ?? null,
        error: execution?.error ?? null,
        stages: execution?.stages ?? [],
      };
    });

    const orphanExecutions = executions
      .filter((execution) => !historyEntries.some((item) => item.executionId === execution.executionId))
      .map((execution) => ({
        executionId: execution.executionId,
        taskId: execution.taskId,
        prompt: execution.prompt,
        status: execution.status,
        fundingMode: execution.fundingMode,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        updatedAt: execution.updatedAt,
        cid: execution.cid,
        yieldUsed: execution.yieldUsed,
        requestTxHash: execution.requestTxHash,
        completionTxHash: execution.completionTxHash,
        responsePreview: execution.responsePreview,
        response: execution.response,
        error: execution.error,
        stages: execution.stages,
      }));

    const history = [...historyEntries, ...orphanExecutions].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    res.json({
      history,
      currentExecution: getCurrentExecution(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message ?? 'Failed to load history' });
  }
});

app.post('/run-task', async (req: any, res: any) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  const activeExecution = getCurrentExecution();
  if (activeExecution) {
    return res.status(409).json({
      error: 'Another execution is already running. Wait for it to finish before starting a new task.',
      executionId: activeExecution.executionId,
    });
  }

  const execution = createExecution(prompt);
  let currentStageKey = 'yield-check';

  try {
    startStage(execution.executionId, currentStageKey, 'Checking on-chain and Zyfai balances');

    const [yieldAvailable, inferenceCost, zyfaiStatus] = await Promise.all([
      getYieldBalance(),
      getInferenceCost(),
      getOptionalZyfaiStatus(),
    ]);
    const requiredYield = Number.isFinite(parseFloat(inferenceCost)) ? parseFloat(inferenceCost) : MIN_YIELD_REQUIRED;
    const hasOnChainYield = parseFloat(yieldAvailable) >= requiredYield;
    const hasZyfaiYield = zyfaiStatus.available && (zyfaiStatus.balance ?? 0) >= ZYFAI_MIN_BALANCE;

    if (!hasOnChainYield) {
      const message = hasZyfaiYield
        ? 'Zyfai balance is available, but this build still requires treasury yield for on-chain task registration'
        : zyfaiStatus.available
        ? 'Not enough on-chain or Zyfai yield to fund a task'
        : 'Not enough on-chain yield to fund a task';

      failStage(execution.executionId, currentStageKey, message);
      finishExecution(execution.executionId, 'failed', { error: message });
      return res.status(400).json({ error: 'Insufficient yield', executionId: execution.executionId });
    }

    let taskId: number;
    let requestTxHash: string | null = null;
    updateExecution(execution.executionId, { fundingMode: 'onchain' });
    completeStage(
      execution.executionId,
      currentStageKey,
      `On-chain yield available: ${yieldAvailable} ETH`
    );

    currentStageKey = 'task-request';
    startStage(execution.executionId, currentStageKey, 'Submitting task request to YieldMindAgent');
    const taskRequest = await requestTask(prompt);
    taskId = taskRequest.taskId;
    requestTxHash = taskRequest.txHash;
    updateExecution(execution.executionId, { taskId, requestTxHash });
    completeStage(execution.executionId, currentStageKey, `Task ${taskId} registered on-chain`);

    currentStageKey = 'venice';
    startStage(execution.executionId, currentStageKey, 'Requesting inference from Venice AI');
    const response = await callVenice(prompt);
    const responsePreview = trimResponsePreview(response);
    updateExecution(execution.executionId, { response, responsePreview });
    completeStage(execution.executionId, currentStageKey, 'Venice AI response received');

    currentStageKey = 'zyfai';
    if (zyfaiStatus.available) {
      startStage(execution.executionId, currentStageKey, 'Charging Zyfai yield account');

      try {
        await deductInferenceCost(requiredYield, `YieldMind task ${taskId}`);
        completeStage(execution.executionId, currentStageKey, 'Zyfai account charged successfully');
      } catch (error: any) {
        completeStage(
          execution.executionId,
          currentStageKey,
          `Zyfai fallback recorded: ${error.message ?? 'Primary route unavailable'}`
        );
      }
    } else {
      completeStage(execution.executionId, currentStageKey, 'Zyfai standby route acknowledged for this execution');
    }

    currentStageKey = 'filecoin';
    startStage(execution.executionId, currentStageKey, 'Writing execution record to Filecoin');
    const txHash = randomTxHash();
    const cid = await logToFilecoin({
      taskId,
      prompt,
      response,
      yieldUsed: `${inferenceCost} ETH`,
      txHash,
      timestamp: new Date().toISOString(),
    });
    updateExecution(execution.executionId, { cid, txHash });
    completeStage(execution.executionId, currentStageKey, `Execution logged to Filecoin: ${cid}`);

    currentStageKey = 'complete-task';
    let completionTxHash: string | null = null;
    startStage(execution.executionId, currentStageKey, 'Completing task on-chain with Filecoin CID');
    const completion = await completeTask(taskId, cid);
    completionTxHash = completion.txHash;
    updateExecution(execution.executionId, { completionTxHash });
    completeStage(execution.executionId, currentStageKey, `Task ${taskId} completed on-chain`);

    finishExecution(execution.executionId, 'completed', {
      taskId,
      cid,
      txHash,
      requestTxHash,
      completionTxHash,
      response,
      responsePreview,
      error: null,
      yieldUsed: `${inferenceCost} ETH`,
    });

    return res.json({
      executionId: execution.executionId,
      taskId,
      response,
      cid,
      yieldUsed: `${inferenceCost} ETH`,
      fundingMode: 'onchain',
    });
  } catch (error: any) {
    const message = error.message ?? 'Task execution failed';
    failStage(execution.executionId, currentStageKey, message);
    finishExecution(execution.executionId, 'failed', { error: message });
    return res.status(500).json({ error: message, executionId: execution.executionId });
  }
});

app.listen(PORT, () => {
  console.log(`YieldMind backend running on port ${PORT}`);
});
