import { useState } from 'react';
import { ethers } from 'ethers';
import { AGENT_ADDRESS, TREASURY_ADDRESS } from '../utils/contracts';

function getDepositErrorMessage(error) {
  const nestedMessage =
    error?.error?.data?.message ||
    error?.data?.message ||
    error?.error?.message ||
    error?.reason ||
    error?.message ||
    'Unknown error';

  const revertMatch = nestedMessage.match(/execution reverted(?::)?\s*(.*)/i);
  if (revertMatch && revertMatch[1]) {
    return revertMatch[1].trim();
  }

  if (nestedMessage.includes('INSUFFICIENT_FUNDS') || /insufficient funds/i.test(nestedMessage)) {
    return 'Insufficient balance for deposit + gas fees';
  }

  if (/Internal JSON-RPC error/i.test(nestedMessage)) {
    return 'Transaction failed at RPC layer. Check you are on Base Sepolia and retry with enough balance.';
  }

  return nestedMessage;
}

function Treasury({ treasury, account, stats, wrongNetwork, onDepositSuccess }) {
  const [depositAmount, setDepositAmount] = useState('0.001');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDeposit = async () => {
    if (!treasury || !account) {
      alert('Please connect your wallet');
      return;
    }

    if (wrongNetwork) {
      alert('Please switch to Base Sepolia before depositing');
      return;
    }

    const amountNum = Number(depositAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      alert('Enter a valid ETH amount');
      return;
    }

    if (amountNum < 0.001) {
      alert('Minimum deposit is 0.001 ETH');
      return;
    }

    setLoading(true);
    setTxHash('');
    setSuccess(false);

    try {
      const value = ethers.utils.parseEther(depositAmount);

      const walletBalance = await treasury.provider.getBalance(account);
      if (walletBalance.lt(value)) {
        alert('Insufficient wallet balance for this deposit');
        return;
      }

      await treasury.callStatic.deposit({ value });

      const tx = await treasury.deposit({
        value,
      });

      setTxHash(tx.hash);
      await tx.wait();
      setSuccess(true);
      setDepositAmount('0.001');

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
        alert(`Deposit failed: ${getDepositErrorMessage(error)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text)',
            marginBottom: '16px',
          }}
        >
          Deposit Principal
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--text2)',
              marginBottom: '8px',
            }}
          >
            Amount (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            min="0.001"
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
              outline: 'none',
            }}
          />
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text3)',
              marginTop: '6px',
            }}
          >
            Minimum: 0.001 ETH
          </div>
        </div>

        <button
          onClick={handleDeposit}
          disabled={loading || !account || wrongNetwork}
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
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Processing...' : wrongNetwork ? 'Switch to Base Sepolia' : 'Deposit ETH'}
        </button>

        {success && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              background: 'var(--green-bg)',
              border: '1px solid var(--green-border)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--green)',
            }}
          >
            Deposit successful. Principal is now locked in the treasury.
          </div>
        )}

        {txHash && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              background: 'var(--blue-bg)',
              border: '1px solid var(--blue-border)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--text2)',
            }}
          >
            Transaction:{' '}
            <a
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

      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text)',
            marginBottom: '16px',
          }}
        >
          Treasury Overview
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          <InfoCard label="Principal Locked" value={`${parseFloat(stats.principalLocked).toFixed(4)} ETH`} tone="text" />
          <InfoCard label="Spendable Yield" value={`${parseFloat(stats.yieldAvailable).toFixed(10)} ETH`} tone="green" />
          <InfoCard label="Agent Spend" value={`${parseFloat(stats.yieldSpent).toFixed(10)} ETH`} tone="amber" />
        </div>

        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: 'var(--blue-bg)',
            border: '1px solid var(--blue-border)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--text2)',
          }}
        >
          Principal is locked. The current Base Sepolia build simulates {stats.apy}% Lido-style yield.
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text)',
            marginBottom: '16px',
          }}
        >
          Contract Addresses
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <AddressRow label="Treasury" value={TREASURY_ADDRESS} />
          <AddressRow label="Agent" value={AGENT_ADDRESS} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, tone }) {
  const color = tone === 'green' ? 'var(--green)' : tone === 'amber' ? 'var(--amber)' : 'var(--text)';

  return (
    <div
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        borderRadius: '8px',
        padding: '12px',
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '4px' }}>{label}</div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: '600',
          color,
          fontFamily: 'var(--font-mono)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function AddressRow({ label, value }) {
  return (
    <div
      style={{
        padding: '10px',
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <span style={{ color: 'var(--text2)' }}>{label}: </span>
      <a
        href={`https://sepolia.basescan.org/address/${value}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--blue)', textDecoration: 'none' }}
      >
        {value.slice(0, 6)}...{value.slice(-4)}
      </a>
    </div>
  );
}

export default Treasury;
