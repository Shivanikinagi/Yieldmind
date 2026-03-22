function Stats({ stats }) {
  const statCards = [
    {
      label: 'Tasks Completed',
      value: stats.tasksCompleted,
      icon: '✓',
      color: 'green'
    },
    {
      label: 'Yield Spent',
      value: `${parseFloat(stats.yieldSpent).toFixed(6)} ETH`,
      icon: '⚡',
      color: 'amber'
    },
    {
      label: 'Principal Locked',
      value: `${parseFloat(stats.principalLocked).toFixed(4)} ETH`,
      icon: '🔒',
      color: 'blue'
    },
    {
      label: 'Yield Available',
      value: `${parseFloat(stats.yieldAvailable).toFixed(8)} ETH`,
      icon: '💰',
      color: 'venice'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {statCards.map((stat, i) => (
        <div
          key={i}
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            animation: 'fadein 0.3s ease-out',
            animationDelay: `${i * 0.1}s`,
            animationFillMode: 'both'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: `var(--${stat.color}-bg)`,
              border: `1px solid var(--${stat.color}-border)`,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              {stat.icon}
            </div>
            <span style={{
              fontSize: '13px',
              color: 'var(--text2)',
              fontWeight: '500'
            }}>
              {stat.label}
            </span>
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)'
          }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Stats;
