import { getCidUrl, getTxUrl, shortHash } from '../utils/proof';

function History({ history, currentExecution, stats }) {
  const yieldAvailable = parseFloat(stats?.yieldAvailable || '0');
  const inferenceCost = parseFloat(stats?.inferenceCost || '0.000000000001');
  const waitingForYield = yieldAvailable < inferenceCost;

  if (currentExecution && !history.length) {
    return (
      <HistoryMessage
        title="Execution in progress"
        detail="The agent is already moving through the rail. This log will populate as soon as the first record is synced."
      />
    );
  }

  if (!history.length) {
    return (
      <HistoryMessage
        title="No executions yet"
        detail={
          waitingForYield
            ? `Yield is still below the ${stats?.inferenceCost || '0.000000000001'} ETH run cost.`
            : 'Run the agent once to populate prompts, stages, proofs, and CIDs.'
        }
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '4px',
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>Execution History</h2>
        <div
          style={{
            padding: '6px 12px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '999px',
            fontSize: '12px',
            color: 'var(--text2)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {history.length} records
        </div>
      </div>

      {history.map((item) => {
        const cidUrl = item.cid ? getCidUrl(item.cid) : null;

        return (
          <div
            key={item.executionId}
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <IdPill label={item.taskId ? `Task #${item.taskId}` : item.executionId} />
                <StatusPill status={item.status} />
                <IdPill label="On-chain funding" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                {new Date(item.updatedAt).toLocaleString()}
              </div>
            </div>

            <Section title="Prompt">{item.prompt}</Section>

            {item.responsePreview && <Section title="Response Preview">{item.responsePreview}</Section>}

            {item.cid && (
              <Section title={cidUrl ? 'Filecoin CID' : 'Proof Record'}>
                {cidUrl ? (
                  <a
                    href={cidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--blue)', textDecoration: 'none', wordBreak: 'break-all' }}
                  >
                    {item.cid}
                  </a>
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{item.cid}</span>
                )}
              </Section>
            )}

            {item.error && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '12px',
                  background: 'var(--red-bg)',
                  border: '1px solid var(--red-border)',
                  borderRadius: '8px',
                  color: 'var(--red)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}
              >
                {item.error}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <MetaChip label="Yield Used" value={item.yieldUsed || '0.0001 ETH'} />
              <MetaChip label="Started" value={new Date(item.startedAt).toLocaleTimeString()} />
              {item.completedAt && <MetaChip label="Completed" value={new Date(item.completedAt).toLocaleTimeString()} />}
            </div>

            {(item.requestTxHash || item.completionTxHash) && (
              <div
                style={{
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {item.requestTxHash && (
                  <a
                    href={getTxUrl(item.requestTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--blue)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                  >
                    Task request tx: {shortHash(item.requestTxHash, 10, 8)}
                  </a>
                )}
                {item.completionTxHash && (
                  <a
                    href={getTxUrl(item.completionTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--blue)', textDecoration: 'none', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                  >
                    Task completion tx: {shortHash(item.completionTxHash, 10, 8)}
                  </a>
                )}
              </div>
            )}

            {!!item.stages?.length && (
              <div
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--border2)',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '10px' }}>Execution Stages</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {item.stages.map((stage) => (
                    <div
                      key={`${item.executionId}-${stage.key}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '12px',
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '4px' }}>{stage.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: '1.6' }}>{stage.message}</div>
                      </div>
                      <StatusPill status={stage.status} compact />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HistoryMessage({ title, detail }) {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.6' }}>{detail}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        marginBottom: '12px',
        padding: '12px',
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        borderRadius: '8px',
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6' }}>{children}</div>
    </div>
  );
}

function IdPill({ label }) {
  return (
    <div
      style={{
        padding: '4px 8px',
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        borderRadius: '6px',
        fontSize: '11px',
        color: 'var(--text2)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {label}
    </div>
  );
}

function MetaChip({ label, value }) {
  return (
    <div
      style={{
        padding: '6px 10px',
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        borderRadius: '999px',
        fontSize: '11px',
        color: 'var(--text2)',
      }}
    >
      <span style={{ color: 'var(--text3)' }}>{label}: </span>
      <span style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

function StatusPill({ status, compact = false }) {
  const palette =
    status === 'completed'
      ? { bg: 'var(--green-bg)', border: 'var(--green-border)', color: 'var(--green)', label: 'Completed' }
      : status === 'running'
      ? { bg: 'var(--blue-bg)', border: 'var(--blue-border)', color: 'var(--blue)', label: 'Running' }
      : status === 'failed'
      ? { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', label: 'Failed' }
      : status === 'skipped' || status === 'simulated'
      ? { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber)', label: 'Simulated' }
      : status === 'standby'
      ? { bg: 'var(--blue-bg)', border: 'var(--blue-border)', color: 'var(--blue)', label: 'Standby' }
      : status === 'targeted'
      ? { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber)', label: 'Target' }
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
      }}
    >
      {palette.label}
    </div>
  );
}

export default History;
