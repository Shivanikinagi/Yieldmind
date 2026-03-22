function formatEth(value) {
  const numeric = parseFloat(value || '0');

  if (numeric === 0) {
    return '0.0000000000 ETH';
  }

  if (numeric >= 1) {
    return `${numeric.toFixed(2)} ETH`;
  }

  if (numeric >= 0.001) {
    return `${numeric.toFixed(4)} ETH`;
  }

  return `${numeric.toFixed(10)} ETH`;
}

function Stats({ stats }) {
  const statCards = [
    {
      label: 'Locked Principal',
      value: formatEth(stats.principalLocked),
      helper: 'Capital stays untouched',
      tone: 'neutral',
    },
    {
      label: 'Agent Spend',
      value: formatEth(stats.yieldSpent),
      helper: 'Paid from yield only',
      tone: 'green',
    },
    {
      label: 'Completed Runs',
      value: `${stats.tasksCompleted}`,
      helper: 'Proof-backed executions',
      tone: 'cyan',
    },
    {
      label: 'Live Yield',
      value: formatEth(stats.yieldAvailable),
      helper: `Inference cost ${stats.inferenceCost} ETH`,
      tone: 'cyan',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '14px',
        marginBottom: '22px',
      }}
    >
      {statCards.map((stat) => (
        <div
          key={stat.label}
          style={{
            background: 'linear-gradient(180deg, rgba(16,20,28,0.98), rgba(12,15,22,0.95))',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '16px',
            minHeight: '124px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '999px',
                background: stat.tone === 'green' ? 'rgba(0,212,170,0.12)' : 'rgba(35,217,255,0.1)',
                border: `1px solid ${stat.tone === 'green' ? 'rgba(0,212,170,0.28)' : 'rgba(35,217,255,0.22)'}`,
              }}
            />
          </div>

          <div
            style={{
              fontSize: 'clamp(20px, 2vw, 30px)',
              lineHeight: '1.05',
              color: 'var(--text)',
              fontWeight: '700',
              letterSpacing: '-0.04em',
              wordBreak: 'break-word',
              fontFamily: stat.label === 'Completed Runs' ? 'var(--font-sans)' : 'var(--font-mono)',
            }}
          >
            {stat.value}
          </div>

          <div>
            <div
              style={{
                width: '44%',
                height: '3px',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #16d6f4, #0ed39a)',
                marginBottom: '8px',
              }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{stat.helper}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Stats;
