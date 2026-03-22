import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', ethers.utils.formatEther(await ethers.provider.getBalance(deployer.address)));

  const WSTETH_PLACEHOLDER = '0x0000000000000000000000000000000000000001';
  const LIDO_PLACEHOLDER = '0x0000000000000000000000000000000000000002';

  console.log('\nDeploying YieldTreasury...');
  const YieldTreasury = await ethers.getContractFactory('YieldTreasury');
  const treasury = await YieldTreasury.deploy(deployer.address, WSTETH_PLACEHOLDER, LIDO_PLACEHOLDER);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log('YieldTreasury deployed to:', treasuryAddress);

  console.log('\nDeploying YieldMindAgent...');
  const YieldMindAgent = await ethers.getContractFactory('YieldMindAgent');
  const agent = await YieldMindAgent.deploy(treasuryAddress);
  await agent.waitForDeployment();
  const agentAddress = await agent.getAddress();
  console.log('YieldMindAgent deployed to:', agentAddress);

  console.log('\nSetting agent address in treasury...');
  const setAgentTx = await treasury.setAgent(agentAddress);
  await setAgentTx.wait();
  console.log('Agent address set');

  console.log('\n=== DEPLOYMENT COMPLETE ===');
  console.log('TREASURY_ADDRESS=', treasuryAddress);
  console.log('AGENT_ADDRESS=', agentAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
