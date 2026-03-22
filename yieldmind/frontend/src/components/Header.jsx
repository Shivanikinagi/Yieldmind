function Header({ account, network, onConnect }) {
  const formatAddress = (addr) => {
    if (!addr) {
      return '';
    }

    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        paddingBottom: '18px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '22px',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '10px',
            color: 'var(--blue)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: '8px',
            fontWeight: '700',
          }}
        >
          YieldMind AI
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: 'clamp(30px, 4vw, 42px)',
              lineHeight: '1',
              color: 'var(--text)',
              fontWeight: '700',
              textShadow: '0 0 18px rgba(35, 217, 255, 0.18)',
            }}
          >
            Yield-Powered Agent
          </h1>
          <span
            style={{
              color: 'var(--cyan)',
              fontSize: '16px',
              fontWeight: '700',
            }}
          >
            v3.0
          </span>
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text2)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Zyfai x Lido x Status Network on {network || 'Base Sepolia'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div
          style={{
            padding: '7px 12px',
            borderRadius: '999px',
            border: '1px solid var(--border2)',
            background: 'rgba(255,255,255,0.02)',
            color: 'var(--text2)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: '600',
          }}
        >
          {network || 'Base Sepolia'}
        </div>

        <div
          style={{
            padding: '7px 12px',
            borderRadius: '999px',
            border: '1px solid var(--border2)',
            background: 'rgba(255,255,255,0.02)',
            color: 'var(--text2)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: '600',
          }}
        >
          {account ? 'Connected' : 'Offline'}
        </div>

        {account ? (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(35,217,255,0.12))',
              border: '1px solid rgba(35,217,255,0.24)',
              color: 'var(--cyan)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {formatAddress(account)}
          </div>
        ) : (
          <button
            onClick={onConnect}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(35,217,255,0.35)',
              background: 'linear-gradient(135deg, #18c7f4, #0ccf9a)',
              color: '#04111b',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(24, 199, 244, 0.22)',
            }}
          >
            Wallet Connect
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
