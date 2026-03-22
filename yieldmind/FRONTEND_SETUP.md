# YieldMind Frontend Setup Guide

Complete guide to running the YieldMind React frontend.

## Prerequisites

- Node.js 16+ installed
- MetaMask browser extension
- Base Sepolia testnet configured in MetaMask
- Deployed YieldMind contracts (see main README)

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Connect MetaMask

1. Open the frontend in your browser
2. Click "Connect Wallet" in the top right
3. Approve the MetaMask connection
4. Ensure you're on Base Sepolia network

## Features

### Dashboard Tab
- Real-time agent status
- Yield accrual rate calculator
- Inference cost and task estimates
- How it works explanation

### Treasury Tab
- Deposit ETH as principal
- View locked principal amount
- Monitor yield available and spent
- Contract address links to Basescan

### Agent Status Tab
- Live agent status indicator
- Integration health checks (Venice AI, Filecoin, Zyfai, Lido)
- Agent capabilities overview
- Execution readiness status

### History Tab
- Complete task history
- Task prompts and results
- Filecoin CID tracking
- Yield spent per task

## Configuration

Contract addresses are configured in `src/utils/contracts.js`:

```javascript
export const TREASURY_ADDRESS = '0x28b1Ea8f2De5f6aa3af8271E15D2bef15F17BB43';
export const AGENT_ADDRESS = '0x20E465f74586adCE1ABcFE512A540Bac6a91AB4C';
```

If you deploy new contracts, update these addresses.

## Network Setup

### Add Base Sepolia to MetaMask

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Enter the following:
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org

### Get Testnet ETH

Visit the Base Sepolia faucet:
https://www.alchemy.com/faucets/base-sepolia

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Troubleshooting

### "Please install MetaMask"
- Install MetaMask browser extension
- Refresh the page

### "Wrong network"
- Switch to Base Sepolia in MetaMask
- Refresh the page

### "Transaction failed"
- Ensure you have enough ETH for gas
- Check minimum deposit is 0.01 ETH
- Verify contract addresses are correct

### Stats not loading
- Check browser console for errors
- Verify you're connected to the correct network
- Ensure contracts are deployed at the configured addresses

## Development

### Project Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global styles
│   ├── components/
│   │   ├── Header.jsx          # Wallet connection
│   │   ├── Stats.jsx           # Statistics cards
│   │   ├── Tabs.jsx            # Tab navigation
│   │   ├── Dashboard.jsx       # Dashboard view
│   │   ├── Treasury.jsx        # Deposit interface
│   │   ├── AgentStatus.jsx     # Agent monitoring
│   │   └── History.jsx         # Task history
│   ├── hooks/
│   │   └── useContract.js      # Contract interaction hook
│   └── utils/
│       └── contracts.js        # ABIs and addresses
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies
```

### Tech Stack

- React 18
- Vite (build tool)
- ethers.js v5 (blockchain interaction)
- CSS Variables (theming)

### Design System

The frontend uses a dark theme with the following color scheme:

- Background: `#080a0f`
- Cards: `#0e1118`
- Borders: `#1e2535`
- Text: `#e2e8f0`
- Green (success): `#00d084`
- Amber (warning): `#f6ad55`
- Blue (info): `#60a5fa`
- Venice (accent): `#a78bfa`

All colors are defined as CSS variables in `index.css`.

## API Reference

### useContract Hook

```javascript
const { treasury, agent, provider } = useContract(account);
```

Returns ethers.js contract instances for interacting with the blockchain.

### Contract Methods

#### Treasury Contract
- `deposit()` - Deposit ETH as principal
- `availableYield()` - Get available yield
- `principalWstETH()` - Get locked principal
- `yieldSpent()` - Get total yield spent
- `inferenceCount()` - Get total inferences

#### Agent Contract
- `taskCount()` - Get total tasks
- `tasks(id)` - Get task details
- `requestTask(prompt)` - Request new task (agent only)

## Support

For issues or questions:
1. Check the main README.md
2. Review REAL_INTEGRATIONS.md for integration status
3. Check browser console for errors
4. Verify contract addresses in contracts.js

## License

MIT
