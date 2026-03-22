import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying to Status Network with account:', deployer.address);
  console.log('Account balance:', ethers.utils.formatEther(await ethers.provider.getBalance(deployer.address)));

  const WSTETH_PLACEHOLDER = '0x0000000000000000000000000000000000000001';
  const LIDO_PLACEHOLDER = '0x0000000000000000000000000000000000000002';

  console.log('\nDeploying YieldTreasury to Status Network...');
  const YieldTreasury = await ethers.getContractFactory('YieldTreasury');
  const treasury = await YieldTreasury.deploy(deployer.address, WSTETH_PLACEHOLDER, LIDO_PLACEHOLDER);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log('YieldTreasury deployed to:', treasuryAddress);

  console.log('\nExecuting gasless transaction...');
  const tx = await treasury.setAgent(deployer.address, {
    gasPrice: 0,
    gasLimit: 100000,
  });
  const receipt = await tx.wait();
  console.log('Gasless tx hash:', receipt?.hash);

  console.log('\n=== STATUS NETWORK DEPLOYMENT COMPLETE ===');
  console.log('Contract:', treasuryAddress);
  console.log('Gasless TX:', receipt?.hash);
  console.log('Chain ID: 1660990954');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
