import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TREASURY_ABI, AGENT_ABI, TREASURY_ADDRESS, AGENT_ADDRESS } from '../utils/contracts';

export function useContract(account) {
  const [treasury, setTreasury] = useState(null);
  const [agent, setAgent] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (!account || !window.ethereum) return;

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = web3Provider.getSigner();

    const treasuryContract = new ethers.Contract(
      TREASURY_ADDRESS,
      TREASURY_ABI,
      signer
    );

    const agentContract = new ethers.Contract(
      AGENT_ADDRESS,
      AGENT_ABI,
      signer
    );

    setProvider(web3Provider);
    setTreasury(treasuryContract);
    setAgent(agentContract);
  }, [account]);

  return { treasury, agent, provider };
}
