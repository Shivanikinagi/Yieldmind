# YieldMind Frontend

React-based frontend for the YieldMind autonomous AI agent platform.

## Features

- 🔗 MetaMask wallet connection
- 📊 Real-time treasury and yield statistics
- 💰 ETH deposit interface for principal locking
- 🤖 Agent status monitoring
- 📜 Task history with Filecoin CID tracking
- 🎨 Modern dark theme UI inspired by DarkAgent

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration

The frontend connects to the following deployed contracts on Base Sepolia:

- Treasury: `0x28b1Ea8f2De5f6aa3af8271E15D2bef15F17BB43`
- Agent: `0x20E465f74586adCE1ABcFE512A540Bac6a91AB4C`

These addresses are configured in `src/utils/contracts.js`.

## Usage

1. Connect your MetaMask wallet (ensure you're on Base Sepolia network)
2. Navigate to the Treasury tab to deposit ETH as principal
3. Monitor yield accrual on the Dashboard
4. View agent status and task history in respective tabs

## Tech Stack

- React 18
- Vite
- ethers.js v5
- CSS Variables for theming

## Network

Base Sepolia Testnet (Chain ID: 84532)
