// Quick test to verify setup without needing .env
console.log('🧪 Testing YieldMind Setup...\n');

// Test 1: Check if contracts compiled
const fs = require('fs');
const path = require('path');

console.log('1. Checking contract compilation...');
const artifactsPath = path.join(__dirname, 'artifacts', 'contracts');
if (fs.existsSync(artifactsPath)) {
  const treasuryPath = path.join(artifactsPath, 'YieldTreasury.sol', 'YieldTreasury.json');
  const agentPath = path.join(artifactsPath, 'YieldMindAgent.sol', 'YieldMindAgent.json');
  
  if (fs.existsSync(treasuryPath) && fs.existsSync(agentPath)) {
    console.log('   ✅ Contracts compiled successfully');
    console.log('   ✅ YieldTreasury.sol artifact found');
    console.log('   ✅ YieldMindAgent.sol artifact found');
  } else {
    console.log('   ❌ Contract artifacts not found');
    console.log('   Run: npm run compile');
  }
} else {
  console.log('   ❌ Artifacts directory not found');
  console.log('   Run: npm run compile');
}

// Test 2: Check dependencies
console.log('\n2. Checking dependencies...');
try {
  const hardhat = require('hardhat');
  console.log('   ✅ Hardhat installed');
} catch (e) {
  console.log('   ❌ Hardhat not found');
}

try {
  const ethers = require('ethers');
  console.log('   ✅ Ethers.js installed');
} catch (e) {
  console.log('   ❌ Ethers.js not found');
}

try {
  const express = require('express');
  console.log('   ✅ Express installed');
} catch (e) {
  console.log('   ❌ Express not found');
}

// Test 3: Check file structure
console.log('\n3. Checking project structure...');
const requiredFiles = [
  'contracts/YieldTreasury.sol',
  'contracts/YieldMindAgent.sol',
  'scripts/deploy.ts',
  'scripts/deployStatus.ts',
  'agent/index.ts',
  'agent/chain.ts',
  'server/index.ts',
  'frontend/index.html',
  'hardhat.config.ts',
  'package.json',
  '.env.example'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Test 4: Check .env
console.log('\n4. Checking environment configuration...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('PRIVATE_KEY=0x') && envContent.length > 100) {
    console.log('   ✅ .env appears configured');
  } else {
    console.log('   ⚠️  .env exists but may need configuration');
    console.log('   Edit .env and add your private key and API keys');
  }
} else {
  console.log('   ⚠️  .env file not found');
  console.log('   Run: cp .env.example .env');
  console.log('   Then edit .env with your keys');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Setup Summary');
console.log('='.repeat(50));

if (allFilesExist) {
  console.log('✅ All required files present');
} else {
  console.log('❌ Some files missing - check above');
}

if (fs.existsSync(artifactsPath)) {
  console.log('✅ Contracts compiled');
} else {
  console.log('⚠️  Run: npm run compile');
}

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
} else {
  console.log('⚠️  Create .env file');
}

console.log('\n📚 Next Steps:');
console.log('1. If contracts not compiled: npm run compile');
console.log('2. If .env missing: cp .env.example .env');
console.log('3. Edit .env with your keys');
console.log('4. Get testnet ETH from faucets');
console.log('5. Deploy: npm run deploy:base');
console.log('6. Read: QUICKSTART.md or SETUP.md');
console.log('\n🚀 Ready to build! Good luck!\n');
