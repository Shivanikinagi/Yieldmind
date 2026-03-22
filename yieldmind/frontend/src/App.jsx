import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Header from './components/Header';
import Stats from './components/Stats';
import Tabs from './components/Tabs';
import Dashboard from './components/Dashboard';
import Treasury from './components/Treasury';
import AgentStatus from './components/AgentStatus';
import History from './components/History';
import { useContract } from './hooks/useContract';
import { fetchApiJson } from './utils/api';

const EMPTY_STATS = {
  tasksCompleted: 0,
  taskCount: 0,
  yieldSpent: '0.0',
  principalLocked: '0.0',
  yieldAvailable: '0.0',
  inferenceCount: 0,
  inferenceCost: '0.000000000001',
  apy: '4.0',
  lastDepositTime: null,
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [contractStats, setContractStats] = useState(EMPTY_STATS);
  const [contractStatsUpdatedAt, setContractStatsUpdatedAt] = useState(Date.now());
  const [backendStatus, setBackendStatus] = useState(null);
  const [historyState, setHistoryState] = useState({ history: [], currentExecution: null });
  const [backendError, setBackendError] = useState('');
  const [liveTick, setLiveTick] = useState(Date.now());
  const { treasury, agent } = useContract(account);

  const forceRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const switchToBaseSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }],
      });
      setWrongNetwork(false);
    } catch (switchError) {
      if (switchError.code === 4902) {
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
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const currentNetwork = await web3Provider.getNetwork();

      if (currentNetwork.chainId === 84532) {
        setNetwork('Base Sepolia');
        setWrongNetwork(false);
      } else {
        setNetwork(`Chain ${currentNetwork.chainId}`);
        setWrongNetwork(true);
        setTimeout(async () => {
          const shouldSwitch = window.confirm(
            `You're on Chain ${currentNetwork.chainId}. Switch to Base Sepolia (84532)?`
          );

          if (shouldSwitch) {
            await switchToBaseSepolia();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert(`Failed to connect wallet: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    let ignore = false;

    const restoreWalletState = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (ignore || !accounts.length) {
          return;
        }

        setAccount(accounts[0]);
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const currentNetwork = await web3Provider.getNetwork();
        const isBaseSepolia = currentNetwork.chainId === 84532;

        setNetwork(isBaseSepolia ? 'Base Sepolia' : `Chain ${currentNetwork.chainId}`);
        setWrongNetwork(!isBaseSepolia);
      } catch (error) {
        console.error('Failed to restore wallet state:', error);
      }
    };

    restoreWalletState();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!treasury || !agent || wrongNetwork) {
      return;
    }

    let mounted = true;

    const loadContractStats = async () => {
      try {
        const [principal, yieldSpent, yieldAvailable, inferenceCount, taskCount, inferenceCost, lastDepositTime] =
          await Promise.all([
            treasury.principalWstETH(),
            treasury.yieldSpent(),
            treasury.availableYield(),
            treasury.inferenceCount(),
            agent.taskCount(),
            agent.INFERENCE_COST(),
            treasury.lastDepositTime(),
          ]);

        if (!mounted) {
          return;
        }

        setContractStats({
          tasksCompleted: taskCount.toNumber(),
          taskCount: taskCount.toNumber(),
          yieldSpent: ethers.utils.formatEther(yieldSpent),
          principalLocked: ethers.utils.formatEther(principal),
          yieldAvailable: ethers.utils.formatEther(yieldAvailable),
          inferenceCount: inferenceCount.toNumber(),
          inferenceCost: ethers.utils.formatEther(inferenceCost),
          apy: '4.0',
          lastDepositTime: lastDepositTime.toNumber(),
        });
        setContractStatsUpdatedAt(Date.now());
      } catch (error) {
        console.error('Failed to load contract stats:', error);
      }
    };

    loadContractStats();
    const interval = setInterval(loadContractStats, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [treasury, agent, wrongNetwork, refreshTrigger]);

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    const handleAccountsChanged = (accounts) => {
      if (!accounts.length) {
        setAccount(null);
        return;
      }

      setAccount(accounts[0]);
      forceRefresh();
    };

    const handleChainChanged = (chainId) => {
      const chainIdNum = parseInt(chainId, 16);
      const isBaseSepolia = chainIdNum === 84532;
      setNetwork(isBaseSepolia ? 'Base Sepolia' : `Chain ${chainIdNum}`);
      setWrongNetwork(!isBaseSepolia);
      forceRefresh();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [forceRefresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadBackendData = async () => {
      try {
        const [statusResponse, historyResponse] = await Promise.all([
          fetchApiJson('/status'),
          fetchApiJson('/history'),
        ]);

        const statusData = statusResponse.data;
        const historyData = historyResponse.data;

        if (!statusResponse.response.ok) {
          throw new Error(statusData?.error || `Status endpoint failed with ${statusResponse.response.status}`);
        }

        if (!historyResponse.response.ok) {
          throw new Error(historyData?.error || `History endpoint failed with ${historyResponse.response.status}`);
        }

        if (!mounted) {
          return;
        }

        setBackendStatus(statusData || null);
        setHistoryState(historyData || { history: [], currentExecution: null });
        setBackendError('');
      } catch (error) {
        console.error('Failed to load backend data:', error);

        if (mounted) {
          setBackendError(error.message || 'Live agent data is unavailable right now.');
        }
      }
    };

    loadBackendData();
    const interval = setInterval(loadBackendData, 4000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshTrigger]);

  const stats = backendStatus?.stats
    ? {
        tasksCompleted: Math.max(backendStatus.stats.taskCount ?? 0, contractStats.tasksCompleted ?? 0),
        taskCount: Math.max(backendStatus.stats.taskCount ?? 0, contractStats.taskCount ?? 0),
        yieldSpent:
          contractStats.yieldSpent && parseFloat(contractStats.yieldSpent || '0') > 0
            ? contractStats.yieldSpent
            : backendStatus.stats.yieldSpent ?? contractStats.yieldSpent,
        principalLocked:
          contractStats.principalLocked && parseFloat(contractStats.principalLocked || '0') > 0
            ? contractStats.principalLocked
            : backendStatus.stats.principal ?? contractStats.principalLocked,
        yieldAvailable:
          contractStats.yieldAvailable && parseFloat(contractStats.yieldAvailable || '0') > 0
            ? contractStats.yieldAvailable
            : backendStatus.stats.yieldAvailable ?? contractStats.yieldAvailable,
        inferenceCount: Math.max(backendStatus.stats.inferenceCount ?? 0, contractStats.inferenceCount ?? 0),
        inferenceCost:
          contractStats.inferenceCost &&
          parseFloat(contractStats.inferenceCost || '0') > 0 &&
          parseFloat(contractStats.inferenceCost || '0') < parseFloat(backendStatus.stats.inferenceCost ?? contractStats.inferenceCost)
            ? contractStats.inferenceCost
            : backendStatus.stats.inferenceCost ?? contractStats.inferenceCost,
        apy: backendStatus.stats.apy ?? contractStats.apy,
        lastDepositTime: contractStats.lastDepositTime,
      }
    : contractStats;

  const statsReferenceTime = backendStatus?.updatedAt
    ? new Date(backendStatus.updatedAt).getTime()
    : contractStatsUpdatedAt;
  const liveElapsedSeconds = Math.max(0, Math.floor((liveTick - statsReferenceTime) / 1000));
  const livePrincipal = parseFloat(stats.principalLocked || '0');
  const liveApy = parseFloat(stats.apy || '4') / 100;
  const liveYieldPerSecond = livePrincipal > 0 ? (livePrincipal * liveApy) / (365 * 24 * 60 * 60) : 0;
  const baseYieldAvailable = parseFloat(stats.yieldAvailable || '0');
  const liveStats =
    liveYieldPerSecond > 0
      ? {
          ...stats,
          yieldAvailable: (baseYieldAvailable + liveYieldPerSecond * liveElapsedSeconds).toString(),
        }
      : stats;

  const currentExecution = historyState.currentExecution ?? backendStatus?.agent?.currentExecution ?? null;

  return (
    <>
      <div className="grid-bg"></div>
      <div className="app">
        <div className="app-shell">
          <aside className="sidebar-shell">
            <Tabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onQuickAction={() => setActiveTab('agent')}
            />
          </aside>

          <main className="main-shell">
            <Header account={account} network={network} onConnect={connectWallet} />

            <div className="content-scroll">
              {wrongNetwork && account && (
                <div
                  style={{
                    padding: '16px',
                    background: 'var(--red-bg)',
                    border: '1px solid var(--red-border)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: 'var(--red)',
                        fontWeight: '700',
                        marginBottom: '4px',
                      }}
                    >
                      Wrong Network
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
                      Please switch to Base Sepolia (Chain ID: 84532) to use wallet actions.
                    </div>
                  </div>
                  <button
                    onClick={switchToBaseSepolia}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--red)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Switch Network
                  </button>
                </div>
              )}

              {backendError && (
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'var(--amber-bg)',
                    border: '1px solid var(--amber-border)',
                    borderRadius: '14px',
                    color: 'var(--text2)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                  }}
                >
                  {backendError}
                </div>
              )}

              <Stats stats={liveStats} />

              {activeTab === 'dashboard' && (
                <Dashboard
                  stats={liveStats}
                  agentStatus={backendStatus?.agent}
                  integrations={backendStatus?.integrations}
                  currentExecution={currentExecution}
                  latestHistory={historyState.history?.[0] ?? null}
                  updatedAt={backendStatus?.updatedAt}
                />
              )}

              {activeTab === 'treasury' && (
                <Treasury
                  treasury={treasury}
                  account={account}
                  stats={liveStats}
                  wrongNetwork={wrongNetwork}
                  onDepositSuccess={forceRefresh}
                />
              )}

              {activeTab === 'agent' && (
                <AgentStatus
                  stats={liveStats}
                  agentStatus={backendStatus?.agent}
                  integrations={backendStatus?.integrations}
                  currentExecution={currentExecution}
                  onTaskExecuted={forceRefresh}
                  updatedAt={backendStatus?.updatedAt}
                />
              )}

              {activeTab === 'history' && (
                <History history={historyState.history ?? []} currentExecution={currentExecution} stats={liveStats} />
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
