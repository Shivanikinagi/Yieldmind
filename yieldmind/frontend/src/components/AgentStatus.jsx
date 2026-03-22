import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function AgentStatus({ agent, stats, treasury }) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [yieldRate, setYieldRate] = useState({
    perMinute: '0',
    perHour: '0',
    perDay: '0'
  });

  const canExecuteTask = parseFloat(stats.yieldAvailable) >= 0.0001;

  // Calculate yield rates
  useEffect(() => {
    const principal = parseFloat(stats.principalLocked);
    const apy = 0.04;
    
    const perYear = principal * apy;
    const perDay = perYear / 365;
    const perHour = perDay / 24;
    const perMinute = perHour / 60;

    setYieldRate({
      perMinute: perMinute.toFixed(12),
      perHour: perHour.toFixed(10),
      perDay: perDay.toFixed(8)
    });
  }, [stats.principalLocked]);

  // Update timestamp every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [agentInfo, setAgentInfo] = useState({
    status: 'Active',
    lastActivity: 'Monitoring yield accrual',
    nextTask: 'Waiting for sufficient yield',
    integrations: [
      { name: 'Venice AI', status: 'connected', icon: '🤖' },
      { name: 'Filecoin', status: 'connected', icon: '📦' },
      { name: 'Zyfai', status: 'connected', icon: '💰' },
      { name: 'Lido stETH', status: 'staking', icon: '🔥' }
    ]
  });

  // Update agent status based on yield
  useEffect(() => {
    if (canExecuteTask) {
      setAgentInfo(prev => ({
        ...prev,
        lastActivity: 'Ready to execute tasks',
        nextTask: 'Sufficient yield available'
      }));
    } else {
      const yieldNeeded = 0.0001 - parseFloat(stats.yieldAvailable);
      const minutesNeeded = Math.ceil(yieldNeeded / parseFloat(yieldRate.perMinute));
      
      setAgentInfo(prev => ({
        ...prev,
        lastActivity: 'Monitoring yield accrual',
        nextTask: `~${minutesNeeded} minutes until next task`
      }));
    }
  }, [canExecuteTask, stats.yieldAvailable, yieldRate.perMinute]);

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
            {agentInfo.status}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            padding: '12px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Last Activity
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text)' }}>
              {agentInfo.lastActivity}
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Next Task
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text)' }}>
              {canExecuteTask ? 'Ready to execute' : agentInfo.nextTask}
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: canExecuteTask ? 'var(--green-bg)' : 'var(--amber-bg)',
            border: `1px solid ${canExecuteTask ? 'var(--green-border)' : 'var(--amber-border)'}`,
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Execution Status
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: canExecuteTask ? 'var(--green)' : 'var(--amber)',
              marginBottom: '4px'
            }}>
              {canExecuteTask 
                ? '✓ Sufficient yield available' 
                : '⏳ Waiting for yield to accrue (need 0.0001 ETH)'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Yield Accrual Rate */}
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
          Real-Time Yield Accrual
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            padding: '12px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px' }}>
              Per Minute
            </div>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)'
            }}>
              {yieldRate.perMinute} ETH
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px' }}>
              Per Hour
            </div>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)'
            }}>
              {yieldRate.perHour} ETH
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '4px' }}>
              Per Day
            </div>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)'
            }}>
              {yieldRate.perDay} ETH
            </div>
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: 'var(--blue-bg)',
          border: '1px solid var(--blue-border)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--text2)'
        }}>
          💡 Based on {stats.principalLocked} ETH principal at 4% APY
        </div>
      </div>

      {/* Integrations */}
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
          Integrations
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {agentInfo.integrations.map((integration, i) => (
            <div
              key={i}
              style={{
                padding: '12px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{integration.icon}</span>
                <span style={{ fontSize: '14px', color: 'var(--text)' }}>
                  {integration.name}
                </span>
              </div>
              <div style={{
                padding: '4px 8px',
                background: 'var(--green-bg)',
                border: '1px solid var(--green-border)',
                borderRadius: '4px',
                fontSize: '11px',
                color: 'var(--green)',
                textTransform: 'uppercase'
              }}>
                {integration.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Capabilities */}
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
          Agent Capabilities
        </h2>

        <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: '1.6' }}>
          <div style={{ 
            marginBottom: '8px',
            padding: '8px',
            background: 'var(--bg3)',
            borderRadius: '6px'
          }}>
            🧠 AI Inference via Venice AI (Llama 3.3 70B)
          </div>
          <div style={{ 
            marginBottom: '8px',
            padding: '8px',
            background: 'var(--bg3)',
            borderRadius: '6px'
          }}>
            📦 Decentralized storage via Filecoin
          </div>
          <div style={{ 
            marginBottom: '8px',
            padding: '8px',
            background: 'var(--bg3)',
            borderRadius: '6px'
          }}>
            💰 Yield management via Zyfai SDK
          </div>
          <div style={{ 
            padding: '8px',
            background: 'var(--bg3)',
            borderRadius: '6px'
          }}>
            🔥 Staking yield via Lido (stETH)
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentStatus;
