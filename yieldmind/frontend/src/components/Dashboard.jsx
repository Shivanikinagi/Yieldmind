function Dashboard({ stats }) {
  const yieldRate = {
    perMinute: (parseFloat(stats.principalLocked) * 0.04 / 525600).toFixed(12),
    perHour: (parseFloat(stats.principalLocked) * 0.04 / 8760).toFixed(10),
    perDay: (parseFloat(stats.principalLocked) * 0.04 / 365).toFixed(8)
  };

  const tasksPerDay = parseFloat(yieldRate.perDay) / 0.0001;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Agent Status Card */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
            Agent Status
          </h2>
          <div style={{
            padding: '6px 12px',
            background: 'var(--green-bg)',
            border: '1px solid var(--green-border)',
            borderRadius: '6px',
            fontSize: '13px',
            color: 'var(--green)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse-v 2s infinite'
            }}></div>
            Active
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Inference Cost
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)'
            }}>
              0.0001 ETH
            </div>
          </div>

          <div style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Total Inferences
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)'
            }}>
              {stats.inferenceCount}
            </div>
          </div>

          <div style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Tasks/Day (Est.)
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)'
            }}>
              {tasksPerDay.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Yield Accrual Card */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'var(--text)',
          marginBottom: '16px'
        }}>
          Yield Accrual Rate
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Per Minute
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)'
            }}>
              {yieldRate.perMinute} ETH
            </div>
          </div>

          <div style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Per Hour
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)'
            }}>
              {yieldRate.perHour} ETH
            </div>
          </div>

          <div style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Per Day
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)'
            }}>
              {yieldRate.perDay} ETH
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--amber-bg)',
          border: '1px solid var(--amber-border)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--text2)'
        }}>
          💡 Based on {stats.apy}% APY from Lido stETH staking
        </div>
      </div>

      {/* How It Works */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'var(--text)',
          marginBottom: '12px'
        }}>
          How It Works
        </h2>
        <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>
            1. Your ETH is locked as principal in the Treasury contract
          </p>
          <p style={{ marginBottom: '8px' }}>
            2. Principal earns staking yield via Lido (stETH)
          </p>
          <p style={{ marginBottom: '8px' }}>
            3. Agent spends only the yield for AI inference tasks
          </p>
          <p>
            4. Your principal remains locked and untouched
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
