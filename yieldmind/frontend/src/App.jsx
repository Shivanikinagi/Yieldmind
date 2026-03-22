import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Header from './components/Header';
import Stats from './components/Stats';
import Tabs from './components/Tabs';
import Dashboard from './components/Dashboard';
import Treasury from './components/Treasury';
import AgentStatus from './components/AgentStatus';
import History from './components/History';
import { useContract } from './hooks/useContract';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const { treasury, agent, provider } = useContract(account);

  // Stats data
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    yieldSpent: '0.0',
    principalLocked: '0.0',
    yieldAvailable: '0.0',
    inferenceCount: 0,
    apy: '4.0'
  });

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Switch to Base Sepolia
  const switchToBaseSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }], // 84532 in hex
      });
      setWrongNetwork(false);
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x14a34',
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
          setWrongNetwork(false);
        } catch (addError) {
          console.error('Failed to add network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      
      // Check if on Base Sepolia (chainId 84532)
      if (network.chainId === 84532) {
        setNetwork('Base Sepolia');
        setWrongNetwork(false);
      } else {
        setNetwork(`Chain ${network.chainId}`);
        setWrongNetwork(true);
        // Automatically prompt to switch
        setTimeout(async () => {
          const shouldSwitch = window.confirm(
            `You're on Chain ${network.chainId}. Switch to Base Sepolia (84532)?`
          );
          if (shouldSwitch) {
            await switchToBaseSepolia();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('Failed to connect wallet: ' + error.message);
    }
  };

  // Load stats
  useEffect(() => {
    if (!treasury || !agent || wrongNetwork) return;

    const loadStats = async () => {
      try {
        const [principal, yieldSpent, yieldAvailable, inferenceCount, taskCount] = 
          await Promise.all([
            treasury.principalWstETH(),
            treasury.yieldSpent(),
            treasury.availableYield(),
            treasury.inferenceCount(),
            agent.taskCount()
          ]);

        setStats({
          tasksCompleted: taskCount.toNumber(),
          yieldSpent: ethers.utils.formatEther(yieldSpent),
          principalLocked: ethers.utils.formatEther(principal),
          yieldAvailable: ethers.utils.formatEther(yieldAvailable),
          inferenceCount: inferenceCount.toNumber(),
          apy: '4.0'
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, [treasury, agent, wrongNetwork, refreshTrigger]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        forceRefresh();
      }
    };

    const handleChainChanged = (chainId) => {
      const chainIdNum = parseInt(chainId, 16);
      if (chainIdNum === 84532) {
        setNetwork('Base Sepolia');
        setWrongNetwork(false);
      } else {
        setNetwork(`Chain ${chainIdNum}`);
        setWrongNetwork(true);
      }
      forceRefresh();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, forceRefresh]);

  return (
    <>
      <div className="grid-bg"></div>
      <div className="app">
        <Header 
          account={account}
          network={network}
          onConnect={connectWallet}
        />
        
        {wrongNetwork && account && (
          <div style={{
            padding: '16px',
            background: 'var(--red-bg)',
            border: '1px solid var(--red-border)',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--red)', fontWeight: '600', marginBottom: '4px' }}>
                ⚠️ Wrong Network
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
                Please switch to Base Sepolia (Chain ID: 84532) to use this app
              </div>
            </div>
            <button
              onClick={switchToBaseSepolia}
              style={{
                padding: '8px 16px',
                background: 'var(--red)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Switch Network
            </button>
          </div>
        )}
        
        <Stats stats={stats} />
        
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats}
            treasury={treasury}
            agent={agent}
          />
        )}
        
        {activeTab === 'treasury' && (
          <Treasury 
            treasury={treasury}
            account={account}
            stats={stats}
            onDepositSuccess={forceRefresh}
          />
        )}
        
        {activeTab === 'agent' && (
          <AgentStatus 
            agent={agent}
            stats={stats}
            treasury={treasury}
          />
        )}
        
        {activeTab === 'history' && (
          <History 
            agent={agent}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>
    </>
  );
}

export default App;
