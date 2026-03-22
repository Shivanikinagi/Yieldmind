import { useState } from 'react';
import { fetchApiJson } from '../utils/api';

const DEFAULT_PROMPT = 'Analyze the strongest yield-funded AI workflow improvements for YieldMind.';

const FALLBACK_STAGES = [
  { key: 'yield-check', label: 'Validate available yield', status: 'pending', message: 'Waiting to start' },
  { key: 'task-request', label: 'Register task', status: 'pending', message: 'Waiting to start' },
  { key: 'venice', label: 'Run Venice inference', status: 'pending', message: 'Waiting to start' },
  { key: 'zyfai', label: 'Charge Zyfai yield account', status: 'pending', message: 'Waiting to start' },
  { key: 'filecoin', label: 'Store execution on Filecoin', status: 'pending', message: 'Waiting to start' },
  { key: 'complete-task', label: 'Finalize task record', status: 'pending', message: 'Waiting to start' },
];

function formatEta(minutes) {
  if (minutes == null) {
    return null;
  }

  if (minutes < 60) {
    return `${minutes} minute(s)`;
  }

  const hours = minutes / 60;
  if (hours < 48) {
    return `${hours.toFixed(1)} hour(s)`;
  }

  return `${(hours / 24).toFixed(1)} day(s)`;
}

function AgentStatus({ stats, agentStatus, integrations, currentExecution, onTaskExecuted, updatedAt }) {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  const yieldAvailable = parseFloat(stats.yieldAvailable || '0');
  const inferenceCost = parseFloat(stats.inferenceCost || '0.000000000001');
  const canExecuteTask = yieldAvailable >= inferenceCost || agentStatus?.canExecuteTask;
  const displayedExecution = currentExecution || agentStatus?.recentExecutions?.[0] || null;
  const stages = displayedExecution?.stages?.length ? displayedExecution.stages : FALLBACK_STAGES;
  const principal = parseFloat(stats.principalLocked || '0');
  const perMinute = principal > 0 ? (principal * 0.04) / 525600 : 0;
  const missingYield = Math.max(inferenceCost - yieldAvailable, 0);
  const etaMinutes = perMinute > 0 ? Math.ceil(missingYield / perMinute) : null;
  const etaLabel = formatEta(etaMinutes);
  const hasActiveExecution = currentExecution?.status === 'running';
  const fundingMode = displayedExecution?.fundingMode || (canExecuteTask ? 'onchain' : 'accruing');
  const activeStage = displayedExecution?.stages?.find((stage) => stage.status === 'running') || null;
  const responsePreview = displayedExecution?.responsePreview || '';
  const stageCounts = stages.reduce(
    (acc, stage) => {
      acc[stage.status] = (acc[stage.status] || 0) + 1;
      return acc;
    },
    { completed: 0, running: 0, pending: 0, failed: 0, simulated: 0, standby: 0, targeted: 0 }
  );

  const integrationItems = [
    {
      name: 'Base Sepolia',
      status: integrations?.base?.status || 'loading',
      detail: integrations?.base?.network || 'Live network',
    },
    {
      name: 'Treasury',
      status: integrations?.chain?.status || 'loading',
      detail: `${yieldAvailable.toFixed(10)} ETH ready`,
    },
    {
      name: 'Lido',
      status: integrations?.lido?.status === 'simulated-testnet' ? 'simulated' : 'loading',
      detail: 'Yield model',
    },
    {
      name: 'Venice',
      status: integrations?.venice?.status || 'loading',
      detail: displayedExecution?.status === 'running' ? 'Inference live' : 'Ready',
    },
    {
      name: 'Filecoin',
      status: integrations?.filecoin?.status || 'loading',
      detail: displayedExecution?.cid ? 'Proof ready' : 'Awaiting CID',
    },
    {
      name: 'Zyfai',
      status: integrations?.zyfai?.status || 'loading',
      detail: integrations?.zyfai?.status === 'connected' ? 'Yield account linked' : 'Standby route',
    },
    {
      name: 'Status',
      status: integrations?.status?.status || 'loading',
      detail: 'Gasless target rail',
    },
  ];

  const handleRunTask = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setSubmitError('Enter a prompt to start the agent execution flow.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    try {
      if (!canExecuteTask) {
        throw new Error(
          etaMinutes == null
            ? 'Deposit more principal first so yield can start accruing.'
            : `Not enough yield yet. Need ${missingYield.toFixed(8)} ETH more, which is about ${etaLabel} at the current principal.`
        );
      }

      if (hasActiveExecution) {
        throw new Error('Another execution is already running. Wait for it to finish before starting a new task.');
      }

      const { response, data: payload } = await fetchApiJson('/run-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      if (!response.ok) {
        throw new Error(payload?.error || `Task execution failed (${response.status})`);
      }

      if (!payload) {
        throw new Error('The server returned an empty response while starting the task.');
      }

      setSubmitMessage(`Live execution started for task #${payload.taskId}.`);
      onTaskExecuted();
    } catch (error) {
      console.error('Failed to run task:', error);
      setSubmitError(error.message || 'Task execution failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '26px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
              Agent Control
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7' }}>
              {agentStatus?.headline || 'Waiting for backend data'}
            </div>
          </div>
          <div
            style={{
              padding: '8px 12px',
              background: canExecuteTask ? 'var(--green-bg)' : 'var(--amber-bg)',
              border: `1px solid ${canExecuteTask ? 'var(--green-border)' : 'var(--amber-border)'}`,
              borderRadius: '999px',
              color: canExecuteTask ? 'var(--green)' : 'var(--amber)',
              fontSize: '12px',
              textTransform: 'uppercase',
            }}
          >
            {canExecuteTask ? 'Ready' : 'Waiting For Yield'}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
          }}
        >
          <SummaryCard
            label="Funding"
            value={fundingMode === 'onchain' ? 'Live yield' : 'Accruing'}
            detail={`${yieldAvailable.toFixed(10)} ETH ready`}
          />
          <SummaryCard
            label="Current Stage"
            value={activeStage?.label || agentStatus?.detail || 'Idle'}
            detail={updatedAt ? `Synced ${new Date(updatedAt).toLocaleTimeString()}` : 'Awaiting sync'}
          />
          <SummaryCard
            label="Latest Run"
            value={displayedExecution ? `#${displayedExecution.taskId || displayedExecution.executionId}` : 'No execution yet'}
            detail={displayedExecution ? displayedExecution.status : 'Run a task to mint proof'}
          />
          <SummaryCard
            label="Payment Rail"
            value={integrations?.zyfai?.status === 'connected' ? 'Zyfai linked' : 'Yield fallback'}
            detail="Inference is paid from treasury yield"
          />
        </div>

        <div
          style={{
            marginTop: '14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
          }}
        >
          <MiniMetric label="Completed" value={`${stageCounts.completed || 0}`} tone="green" />
          <MiniMetric label="Running" value={`${stageCounts.running || 0}`} tone="blue" />
          <MiniMetric label="Pending" value={`${stageCounts.pending || 0}`} tone="neutral" />
        </div>

        {!canExecuteTask && (
          <div
            style={{
              marginTop: '14px',
              padding: '14px 16px',
              background: 'var(--amber-bg)',
              border: '1px solid var(--amber-border)',
              borderRadius: '12px',
              color: 'var(--text2)',
              fontSize: '13px',
              lineHeight: '1.75',
            }}
          >
            Need {missingYield.toFixed(8)} ETH more yield.
            {etaLabel ? ` ETA ${etaLabel}.` : ' Deposit principal to begin accrual.'}
          </div>
        )}
      </div>

      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '26px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '14px' }}>
          Run Agent Task
        </h2>

        <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '16px', lineHeight: '1.75', maxWidth: '720px' }}>
          Yield pays for inference. Proof lands in the log after completion.
        </div>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={4}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '12px',
            color: 'var(--text)',
            fontSize: '14px',
            lineHeight: '1.7',
            resize: 'vertical',
            marginBottom: '16px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRunTask}
            disabled={submitting || !canExecuteTask || hasActiveExecution}
            style={{
              padding: '12px 18px',
              background: submitting || !canExecuteTask || hasActiveExecution ? 'var(--text3)' : 'var(--green)',
              border: 'none',
              borderRadius: '10px',
              color: 'var(--bg)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: submitting || !canExecuteTask || hasActiveExecution ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting
              ? 'Starting...'
              : hasActiveExecution
              ? 'Execution Running'
              : !canExecuteTask
              ? 'Waiting For Yield'
              : 'Run Live Flow'}
          </button>

          {submitMessage && <div style={{ color: 'var(--green)', fontSize: '13px' }}>{submitMessage}</div>}
          {submitError && <div style={{ color: 'var(--red)', fontSize: '13px' }}>{submitError}</div>}
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '26px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '20px' }}>
          Live Execution Flow
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {stages.map((stage, index) => (
            <div
              key={stage.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr auto',
                gap: '14px',
                alignItems: 'start',
                padding: '16px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: '14px',
                boxShadow: stage.status === 'running' ? '0 0 0 1px rgba(35,217,255,0.12) inset' : 'none',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text2)',
                  fontSize: '12px',
                }}
              >
                {index + 1}
              </div>
              <div>
                <div style={{ fontSize: '15px', color: 'var(--text)', marginBottom: '8px', fontWeight: '600' }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.8', maxWidth: '700px' }}>{stage.message}</div>
                {stage.startedAt && (
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '8px' }}>
                    {new Date(stage.startedAt).toLocaleString()}
                  </div>
                )}
              </div>
              <StageBadge status={stage.status} />
            </div>
          ))}
        </div>

        {responsePreview && (
          <div
            style={{
              marginTop: '16px',
              padding: '18px',
              background: 'var(--blue-bg)',
              border: '1px solid var(--blue-border)',
              borderRadius: '14px',
            }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Response Preview</div>
            <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.85', maxWidth: '760px' }}>{responsePreview}</div>
          </div>
        )}
      </div>

      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '26px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '20px' }}>
          Integration Health
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
          }}
        >
          {integrationItems.map((integration) => (
            <div
              key={integration.name}
              style={{
                padding: '16px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>{integration.name}</div>
                <StageBadge status={normalizeIntegrationStatus(integration.status)} compact />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.75' }}>{integration.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail }) {
  return (
    <div
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        borderRadius: '14px',
        padding: '18px',
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '15px', color: 'var(--text)', marginBottom: '8px', lineHeight: '1.55', fontWeight: '600' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: '1.75' }}>{detail}</div>
    </div>
  );
}

function MiniMetric({ label, value, tone }) {
  const palette =
    tone === 'green'
      ? { bg: 'var(--green-bg)', border: 'var(--green-border)', color: 'var(--green)' }
      : tone === 'blue'
      ? { bg: 'var(--blue-bg)', border: 'var(--blue-border)', color: 'var(--blue)' }
      : { bg: 'var(--bg)', border: 'var(--border)', color: 'var(--text2)' };

  return (
    <div
      style={{
        padding: '12px 14px',
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: '12px',
      }}
    >
      <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: '700', color: palette.color }}>{value}</div>
    </div>
  );
}

function normalizeIntegrationStatus(status) {
  if (status === 'connected' || status === 'live' || status === 'ready') {
    return 'completed';
  }

  if (status === 'active') {
    return 'running';
  }

  if (status === 'simulated-testnet' || status === 'simulated') {
    return 'simulated';
  }

  if (status === 'standby') {
    return 'standby';
  }

  if (status === 'targeted') {
    return 'targeted';
  }

  return status === 'loading' ? 'pending' : 'running';
}

function StageBadge({ status, compact = false }) {
  const palette =
    status === 'completed'
      ? { bg: 'var(--green-bg)', border: 'var(--green-border)', color: 'var(--green)', label: 'Completed' }
      : status === 'running'
      ? { bg: 'var(--blue-bg)', border: 'var(--blue-border)', color: 'var(--blue)', label: 'Running' }
      : status === 'failed'
      ? { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', label: 'Failed' }
      : status === 'simulated'
      ? { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber)', label: 'Simulated' }
      : status === 'targeted'
      ? { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber)', label: 'Target' }
      : status === 'standby'
      ? { bg: 'var(--blue-bg)', border: 'var(--blue-border)', color: 'var(--blue)', label: 'Standby' }
      : { bg: 'var(--bg)', border: 'var(--border)', color: 'var(--text2)', label: 'Pending' };

  return (
    <div
      style={{
        padding: compact ? '4px 8px' : '5px 10px',
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: '999px',
        color: palette.color,
        fontSize: compact ? '10px' : '11px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        animation: status === 'running' ? 'pulse-v 1.4s ease infinite' : 'none',
      }}
    >
      {palette.label}
    </div>
  );
}

export default AgentStatus;
