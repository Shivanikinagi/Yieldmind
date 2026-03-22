function Header({ account, network, onConnect }) {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header style={{ marginBottom: '32px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--green-bg)',
            border: '1px solid var(--green-border)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🧠
          </div>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '2px'
            }}>
              YieldMind
            </h1>
            <p style={{ 
              fontSize: '13px', 
              color: 'var(--text2)',
              fontFamily: 'var(--font-mono)'
            }}>
              Autonomous AI Agent • Yield-Funded
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {network && (
            <div style={{
              padding: '6px 12px',
              background: 'var(--blue-bg)',
              border: '1px solid var(--blue-border)',
              borderRadius: '6px',
              fontSize: '13px',
              color: 'var(--blue)',
              fontFamily: 'var(--font-mono)'
            }}>
              {network}
            </div>
          )}
          
          {account ? (
            <div style={{
              padding: '8px 16px',
              background: 'var(--green-bg)',
              border: '1px solid var(--green-border)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--green)',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--green)',
                animation: 'pulse-v 2s infinite'
              }}></div>
              {formatAddress(account)}
            </div>
          ) : (
            <button
              onClick={onConnect}
              style={{
                padding: '8px 16px',
                background: 'var(--green)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--bg)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'var(--green2)'}
              onMouseOut={(e) => e.target.style.background = 'var(--green)'}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
