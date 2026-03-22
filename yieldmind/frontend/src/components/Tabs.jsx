function Tabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'treasury', label: 'Treasury', icon: '🏦' },
    { id: 'agent', label: 'Agent Status', icon: '🤖' },
    { id: 'history', label: 'History', icon: '📜' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '6px'
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: activeTab === tab.id ? 'var(--bg3)' : 'transparent',
            border: activeTab === tab.id ? '1px solid var(--border2)' : '1px solid transparent',
            borderRadius: '8px',
            color: activeTab === tab.id ? 'var(--text)' : 'var(--text2)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            if (activeTab !== tab.id) {
              e.target.style.background = 'var(--bg3)';
              e.target.style.color = 'var(--text)';
            }
          }}
          onMouseOut={(e) => {
            if (activeTab !== tab.id) {
              e.target.style.background = 'transparent';
              e.target.style.color = 'var(--text2)';
            }
          }}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default Tabs;
