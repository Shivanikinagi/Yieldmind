import * as fs from 'fs';
import * as path from 'path';

export type ExecutionState = 'idle' | 'running' | 'completed' | 'failed';
export type StageState = 'pending' | 'running' | 'completed' | 'failed';

export interface ExecutionStage {
  key: string;
  label: string;
  status: StageState;
  message: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ExecutionRecord {
  executionId: string;
  prompt: string;
  status: ExecutionState;
  fundingMode: 'onchain' | 'pending';
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
  taskId: number | null;
  cid: string | null;
  txHash: string | null;
  requestTxHash: string | null;
  completionTxHash: string | null;
  yieldUsed: string;
  response: string | null;
  responsePreview: string | null;
  error: string | null;
  stages: ExecutionStage[];
}

interface ExecutionStoreData {
  executions: ExecutionRecord[];
}

const MAX_EXECUTIONS = 50;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'executions.json');
const SUPPORTED_FUNDING_MODES = new Set(['onchain', 'pending']);

const DEFAULT_STAGES: Array<Pick<ExecutionStage, 'key' | 'label'>> = [
  { key: 'yield-check', label: 'Validate available yield' },
  { key: 'task-request', label: 'Register task' },
  { key: 'venice', label: 'Run Venice inference' },
  { key: 'zyfai', label: 'Charge Zyfai yield account' },
  { key: 'filecoin', label: 'Store execution on Filecoin' },
  { key: 'complete-task', label: 'Finalize task record' },
];

let store: ExecutionStoreData = loadStore();

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ executions: [] }, null, 2));
  }
}

function loadStore(): ExecutionStoreData {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ExecutionStoreData>;
    const executions = Array.isArray(parsed.executions)
      ? parsed.executions
          .filter((execution: any) => SUPPORTED_FUNDING_MODES.has(execution?.fundingMode))
          .map((execution: any) => ({
            ...execution,
            fundingMode: execution?.fundingMode === 'onchain' ? 'onchain' : 'pending',
          }))
      : [];

    return {
      executions,
    };
  } catch (error) {
    console.error('Failed to load execution store:', error);
    return { executions: [] };
  }
}

function saveStore() {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function nowIso() {
  return new Date().toISOString();
}

function buildDefaultStages(): ExecutionStage[] {
  return DEFAULT_STAGES.map((stage) => ({
    ...stage,
    status: 'pending',
    message: 'Waiting to start',
    startedAt: null,
    completedAt: null,
  }));
}

function mutateExecution(
  executionId: string,
  updater: (execution: ExecutionRecord) => void
): ExecutionRecord {
  const execution = store.executions.find((item) => item.executionId === executionId);

  if (!execution) {
    throw new Error(`Execution ${executionId} not found`);
  }

  updater(execution);
  execution.updatedAt = nowIso();
  saveStore();
  return execution;
}

export function createExecution(prompt: string): ExecutionRecord {
  const timestamp = Date.now();
  const execution: ExecutionRecord = {
    executionId: `run-${timestamp}`,
    prompt,
    status: 'running',
    fundingMode: 'pending',
    startedAt: nowIso(),
    completedAt: null,
    updatedAt: nowIso(),
    taskId: null,
    cid: null,
    txHash: null,
    requestTxHash: null,
    completionTxHash: null,
    yieldUsed: '0.0001 ETH',
    response: null,
    responsePreview: null,
    error: null,
    stages: buildDefaultStages(),
  };

  store.executions.unshift(execution);
  store.executions = store.executions.slice(0, MAX_EXECUTIONS);
  saveStore();
  return execution;
}

export function updateExecution(
  executionId: string,
  partial: Partial<Omit<ExecutionRecord, 'executionId' | 'stages'>>
): ExecutionRecord {
  return mutateExecution(executionId, (execution) => {
    Object.assign(execution, partial);
  });
}

export function startStage(executionId: string, stageKey: string, message: string): ExecutionRecord {
  return mutateExecution(executionId, (execution) => {
    const stage = execution.stages.find((item) => item.key === stageKey);
    if (!stage) {
      throw new Error(`Stage ${stageKey} not found`);
    }

    stage.status = 'running';
    stage.message = message;
    stage.startedAt = stage.startedAt ?? nowIso();
    stage.completedAt = null;
  });
}

export function completeStage(executionId: string, stageKey: string, message: string): ExecutionRecord {
  return mutateExecution(executionId, (execution) => {
    const stage = execution.stages.find((item) => item.key === stageKey);
    if (!stage) {
      throw new Error(`Stage ${stageKey} not found`);
    }

    const completedAt = nowIso();
    stage.status = 'completed';
    stage.message = message;
    stage.startedAt = stage.startedAt ?? completedAt;
    stage.completedAt = completedAt;
  });
}

export function failStage(executionId: string, stageKey: string, message: string): ExecutionRecord {
  return mutateExecution(executionId, (execution) => {
    const stage = execution.stages.find((item) => item.key === stageKey);
    if (!stage) {
      throw new Error(`Stage ${stageKey} not found`);
    }

    const failedAt = nowIso();
    stage.status = 'failed';
    stage.message = message;
    stage.startedAt = stage.startedAt ?? failedAt;
    stage.completedAt = failedAt;
  });
}

export function finishExecution(
  executionId: string,
  status: Extract<ExecutionState, 'completed' | 'failed'>,
  options: {
    error?: string | null;
    response?: string | null;
    responsePreview?: string | null;
    cid?: string | null;
    txHash?: string | null;
    requestTxHash?: string | null;
    completionTxHash?: string | null;
    taskId?: number | null;
    yieldUsed?: string | null;
  } = {}
): ExecutionRecord {
  return mutateExecution(executionId, (execution) => {
    execution.status = status;
    execution.completedAt = nowIso();
    execution.error = options.error ?? execution.error;
    execution.response = options.response ?? execution.response;
    execution.responsePreview = options.responsePreview ?? execution.responsePreview;
    execution.cid = options.cid ?? execution.cid;
    execution.txHash = options.txHash ?? execution.txHash;
    execution.requestTxHash = options.requestTxHash ?? execution.requestTxHash;
    execution.completionTxHash = options.completionTxHash ?? execution.completionTxHash;
    execution.taskId = options.taskId ?? execution.taskId;
    execution.yieldUsed = options.yieldUsed ?? execution.yieldUsed;
  });
}

export function getExecutions(limit?: number): ExecutionRecord[] {
  const items = store.executions.map((execution) => ({
    ...execution,
    stages: execution.stages.map((stage) => ({ ...stage })),
  }));

  return typeof limit === 'number' ? items.slice(0, limit) : items;
}

export function getCurrentExecution(): ExecutionRecord | null {
  const current = store.executions.find((execution) => execution.status === 'running');
  return current ? { ...current, stages: current.stages.map((stage) => ({ ...stage })) } : null;
}

export function recoverStaleExecutions(maxAgeMs = 120000): number {
  const cutoff = Date.now() - maxAgeMs;
  let recovered = 0;

  for (const execution of store.executions) {
    if (execution.status !== 'running') {
      continue;
    }

    const updatedAt = new Date(execution.updatedAt).getTime();
    if (Number.isNaN(updatedAt) || updatedAt > cutoff) {
      continue;
    }

    execution.status = 'failed';
    execution.completedAt = nowIso();
    execution.updatedAt = execution.completedAt;
    execution.error = execution.error ?? 'Recovered stale execution after backend restart';

    for (const stage of execution.stages) {
      if (stage.status === 'running') {
        stage.status = 'failed';
        stage.message = 'Recovered as failed after backend restart';
        stage.completedAt = execution.completedAt;
      }
    }

    recovered += 1;
  }

  if (recovered > 0) {
    saveStore();
  }

  return recovered;
}
