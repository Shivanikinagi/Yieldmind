import SponsorProof from './SponsorProof';

function Dashboard({ stats, agentStatus, integrations, currentExecution, latestHistory, updatedAt }) {
  const principal = parseFloat(stats.principalLocked || '0');
  const inferenceCost = parseFloat(stats.inferenceCost || '0.000000000001');
  const apy = parseFloat(stats.apy || '4');
  const perDay = principal > 0 ? (principal * (apy / 100)) / 365 : 0;
  const tasksPerDay = inferenceCost > 0 ? perDay / inferenceCost : 0;
  const yieldAvailable = parseFloat(stats.yieldAvailable || '0');
  const activeRecord = currentExecution || latestHistory || null;
  const activeMode = currentExecution?.fundingMode || (yieldAvailable >= inferenceCost ? 'onchain' : 'accruing');

  const flowItems = [
    {
      title: 'Lock principal',
      description: 'User funds the treasury once. Principal remains untouched.',
      status: principal > 0 ? 'completed' : 'pending',
    },
    {
      title: 'Accrue yield',
      description: `Yield rail runs at ${stats.apy}% APY in the current Base Sepolia build.`,
      status: yieldAvailable > 0 ? 'completed' : 'running',
    },
    {
      title: 'Fund inference',
      description: 'The agent spends yield, not principal, to pay for each run.',
      status: stats.taskCount > 0 ? 'completed' : currentExecution ? 'running' : 'pending',
    },
    {
      title: 'Write proof',
      description: 'Output, storage proof, and settlement data are synced into the execution log.',
      status: latestHistory?.status === 'completed' ? 'completed' : currentExecution ? 'running' : 'pending',
    },
  ];

  const heroCards = [
    {
      label: 'Funding Mode',
      value: activeMode === 'onchain' ? 'Live yield' : 'Yield accruing',
      detail: 'Principal stays locked while yield pays',
    },
    {
      label: 'Agent State',
      value: agentStatus?.headline || 'Awaiting backend',
      detail: agentStatus?.detail || 'Start the backend server to unlock live execution.',
    },
    {
      label: 'Latest Proof',
      value: activeRecord?.cid || 'No proof yet',
      detail: activeRecord?.cid ? 'Stored after execution completes' : 'First completed run will mint proof artifacts',
    },
    {
      label: 'Target Stack',
      value: 'Zyfai / Lido / Status',
      detail: updatedAt ? `Synced ${new Date(updatedAt).toLocaleTimeString()}` : 'Awaiting sync',
    },
  ];

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
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '20px' }}>
          Yield-Powered Story
        </h2>

        <div
          style={{
            marginBottom: '20px',
            padding: '22px',
            background: 'linear-gradient(135deg, rgba(17,27,36,0.96), rgba(8,15,22,0.94))',
            border: '1px solid rgba(35,217,255,0.18)',
            borderRadius: '16px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--cyan)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Self-funded AI agent
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', marginBottom: '12px', lineHeight: '1.15', maxWidth: '620px' }}>
            Deposit once. Let yield pay for thinking.
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.8', maxWidth: '760px' }}>
            Treasury principal remains locked while accrued yield funds execution, inference, and proof recording across the live workflow.
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}
        >
          {heroCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: '14px',
                padding: '18px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{card.label}</div>
              <div style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '10px', lineHeight: '1.45', fontWeight: '600' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: '1.75' }}>{card.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <SponsorProof
        stats={stats}
        integrations={integrations}
        latestHistory={latestHistory}
        currentExecution={currentExecution}
        updatedAt={updatedAt}
      />

      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '26px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '20px' }}>
          Yield Engine
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
          }}
        >
          <MetricCard label="Spendable Yield" value={`${yieldAvailable.toFixed(10)} ETH`} />
          <MetricCard label="Per Day" value={`${perDay.toFixed(8)} ETH`} />
          <MetricCard label="Inference Cost" value={`${inferenceCost.toFixed(4)} ETH`} />
          <MetricCard label="Runs / Day" value={tasksPerDay.toFixed(2)} />
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
          Execution Rail
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {flowItems.map((item, index) => (
            <div
              key={item.title}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr auto',
                gap: '14px',
                alignItems: 'start',
                padding: '16px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: '14px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    item.status === 'completed'
                      ? 'var(--green-bg)'
                      : item.status === 'running'
                      ? 'var(--blue-bg)'
                      : 'var(--bg)',
                  border:
                    item.status === 'completed'
                      ? '1px solid var(--green-border)'
                      : item.status === 'running'
                      ? '1px solid var(--blue-border)'
                      : '1px solid var(--border)',
                  color:
                    item.status === 'completed'
                      ? 'var(--green)'
                      : item.status === 'running'
                      ? 'var(--blue)'
                      : 'var(--text2)',
                  fontWeight: '600',
                }}
              >
                {index + 1}
              </div>
              <div>
                <div style={{ fontSize: '15px', color: 'var(--text)', marginBottom: '8px', fontWeight: '600' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.8', maxWidth: '680px' }}>
                  {item.description}
                </div>
              </div>
              <StatusPill status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        borderRadius: '14px',
        padding: '18px',
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}>
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const palette =
    status === 'completed'
      ? { bg: 'var(--green-bg)', border: 'var(--green-border)', color: 'var(--green)', label: 'Completed' }
      : status === 'running'
      ? { bg: 'var(--blue-bg)', border: 'var(--blue-border)', color: 'var(--blue)', label: 'Live' }
      : { bg: 'var(--bg)', border: 'var(--border)', color: 'var(--text2)', label: 'Pending' };

  return (
    <div
      style={{
        padding: '4px 10px',
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: '999px',
        fontSize: '11px',
        color: palette.color,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {palette.label}
    </div>
  );
}

export default Dashboard;
