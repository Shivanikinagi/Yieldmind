function Tabs({ activeTab, onTabChange, onQuickAction }) {
  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: 'OV' },
    { id: 'treasury', label: 'Treasury', icon: 'TR' },
    { id: 'agent', label: 'Agent', icon: 'AI' },
    { id: 'history', label: 'Proof Log', icon: 'PR' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ marginBottom: '22px' }}>
        <div
          style={{
            fontSize: '26px',
            color: 'var(--text)',
            fontWeight: '700',
            marginBottom: '6px',
          }}
        >
          YieldMind
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--cyan)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: '600',
          }}
        >
          Zyfai x Lido x Status
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: selected ? '1px solid rgba(35,217,255,0.3)' : '1px solid var(--border)',
                background: selected
                  ? 'linear-gradient(135deg, rgba(23,42,55,0.95), rgba(10,27,38,0.9))'
                  : 'rgba(255,255,255,0.015)',
                color: selected ? 'var(--text)' : 'var(--text2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                boxShadow: selected ? '0 0 0 1px rgba(35,217,255,0.08) inset' : 'none',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selected ? 'rgba(35,217,255,0.14)' : 'rgba(255,255,255,0.04)',
                  color: selected ? 'var(--cyan)' : 'var(--text3)',
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                }}
              >
                {tab.icon}
              </span>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <button
          onClick={onQuickAction}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(35,217,255,0.35)',
            background: 'linear-gradient(135deg, #18c7f4, #0ccf9a)',
            color: '#04111b',
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 12px 24px rgba(24, 199, 244, 0.18)',
          }}
        >
          Launch Flow
        </button>

        <div
          style={{
            marginTop: '18px',
            fontSize: '11px',
            color: 'var(--text3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Self-funded AI
        </div>
      </div>
    </div>
  );
}

export default Tabs;
