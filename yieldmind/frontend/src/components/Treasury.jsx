import { useState } from 'react';
import { ethers } from 'ethers';

function Treasury({ treasury, account, stats, onDepositSuccess }) {
  const [depositAmount, setDepositAmount] = useState('0.01');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDeposit = async () => {
    if (!treasury || !account) {
      alert('Please connect your wallet');
      return;
    }

    if (parseFloat(depositAmount) < 0.01) {
      alert('Minimum deposit is 0.01 ETH');
      return;
    }

    setLoading(true);
    setTxHash('');
    setSuccess(false);

    try {
      const tx = await treasury.deposit({
        value: ethers.utils.parseEther(depositAmount)
      });
      
      setTxHash(tx.hash);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      setSuccess(true);
      setDepositAmount('0.01');
      
      // Trigger refresh in parent component
      if (onDepositSuccess) {
        setTimeout(() => {
          onDepositSuccess();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Deposit failed:', error);
      if (error.code === 4001) {
        alert('Transaction rejected by user');
      } else {
        alert('Deposit failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Deposit Card */}
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
          Deposit Principal
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--text2)',
            marginBottom: '8px'
          }}>
            Amount (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--bg3)',
              border: '1px solid var(--border2)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '16px',
              fontFamily: 'var(--font-mono)',
              outline: 'none'
            }}
          />
          <div style={{
            fontSize: '12px',
            color: 'var(--text3)',
            marginTop: '6px'
          }}>
            Minimum: 0.01 ETH
          </div>
        </div>

        <button
          onClick={handleDeposit}
          disabled={loading || !account}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? 'var(--text3)' : 'var(--green)',
            border: 'none',
            borderRadius: '8px',
            color: 'var(--bg)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading && account) e.target.style.background = 'var(--green2)';
          }}
          onMouseOut={(e) => {
            if (!loading && account) e.target.style.background = 'var(--green)';
          }}
        >
          {loading ? 'Processing...' : 'Deposit ETH'}
        </button>

        {success && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'var(--green-bg)',
            border: '1px solid var(--green-border)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--green)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✅</span>
            <span>Deposit successful! Principal locked in treasury.</span>
          </div>
        )}

        {txHash && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'var(--blue-bg)',
            border: '1px solid var(--blue-border)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--text2)'
          }}>
            Transaction: <a 
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--blue)', textDecoration: 'none' }}
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          </div>
        )}
      </div>

      {/* Treasury Info */}
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
          Treasury Overview
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
              Total Principal
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)'
            }}>
              {parseFloat(stats.principalLocked).toFixed(4)} ETH
            </div>
          </div>

          <div style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Yield Available
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: 'var(--green)',
              fontFamily: 'var(--font-mono)'
            }}>
              {parseFloat(stats.yieldAvailable).toFixed(8)} ETH
            </div>
          </div>

          <div style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>
              Yield Spent
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: 'var(--amber)',
              fontFamily: 'var(--font-mono)'
            }}>
              {parseFloat(stats.yieldSpent).toFixed(6)} ETH
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--blue-bg)',
          border: '1px solid var(--blue-border)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--text2)'
        }}>
          🔒 Your principal is locked and earning {stats.apy}% APY via Lido staking
        </div>
      </div>

      {/* Contract Addresses */}
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
          Contract Addresses
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            padding: '10px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)'
          }}>
            <span style={{ color: 'var(--text2)' }}>Treasury: </span>
            <a 
              href="https://sepolia.basescan.org/address/0x28b1Ea8f2De5f6aa3af8271E15D2bef15F17BB43"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--blue)', textDecoration: 'none' }}
            >
              0x28b1...BB43
            </a>
          </div>

          <div style={{
            padding: '10px',
            background: 'var(--bg3)',
            border: '1px solid var(--border2)',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)'
          }}>
            <span style={{ color: 'var(--text2)' }}>Agent: </span>
            <a 
              href="https://sepolia.basescan.org/address/0x20E465f74586adCE1ABcFE512A540Bac6a91AB4C"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--blue)', textDecoration: 'none' }}
            >
              0x20E4...AB4C
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Treasury;
