# 🧠 YieldMind - AI Agent Funded by Staking Yield

An autonomous AI agent that funds its own compute costs using Lido staking yield, never touching the principal.

## 🎯 Concept

```
User deposits ETH → Staked via Lido → Earns yield (4% APY)
                                          ↓
                              Agent spends ONLY yield
                                          ↓
                              Principal stays locked forever
```

**Key Innovation**: The agent is self-sustaining. As long as staking yields exist, the agent can operate indefinitely without additional funding.

---

## 🏆 Hackathon Tracks

- **Lido ($3,000)**: Staking yield treasury management
- **Zyfai ($1,000)**: SDK integration for yield accounts
- **Total**: $4,000+ in prizes

---

## 🚀 Quick Start (10 Minutes)

### Prerequisites
- MetaMask wallet
- Base Sepolia testnet ETH ([get from faucet](https://www.alchemy.com/faucets/base-sepolia))
- Venice API key (optional - [get here](https://venice.ai))

### Step 1: Deploy Contracts

**Option A: Remix IDE (Recommended - No Installation)**

1. Go to https://remix.ethereum.org
2. Create `YieldTreasury.sol` and `YieldMindAgent.sol` (copy from `contracts/` folder)
3. Compile with Solidity 0.8.19+
4. Connect MetaMask to Base Sepolia
5. Deploy YieldTreasury with constructor params:
   - `_agent`: `0x0000000000000000000000000000000000000000`
   - `_wstETH`: `0x0000000000000000000000000000000000000001`
   - `_lido`: `0x0000000000000000000000000000000000000002`
6. Deploy YieldMindAgent with `_treasury` = YieldTreasury address
7. Call `setAgent()` on YieldTreasury with YieldMindAgent address
8. Call `deposit()` with 0.1 ETH

**Option B: Foundry CLI**

```bash
# Install Foundry (Git Bash on Windows)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Build and deploy
forge build
bash deploy.sh
```

### Step 2: Configure Environment

Update `.env` with your deployed contract addresses:

```env
TREASURY_ADDRESS=0x...
AGENT_ADDRESS=0x...
VENICE_API_KEY=your_key_here  # Optional
```

### Step 3: Run Agent

```bash
npm install
npm run agent
```

Expected output:
```
🤖 YieldMind Agent Starting...

=== Treasury Status ===
Principal (locked): 0.1 ETH
Yield available: 0.0001 ETH
Yield spent: 0.0 ETH
Inferences funded: 0

── Task 1: Analyze current DeFi yield opportunities on Base
   ✓ Yield sufficient — requesting inference...
   ✓ Task 1 registered on-chain
   ✓ Paid from YIELD ONLY (principal remains locked)
   → Calling Venice AI...
   ✓ Response: ...
   ✓ Task complete. Filecoin CID: bafyrei...
```

---

## 📁 Project Structure

```
yieldmind/
├── contracts/
│   ├── YieldTreasury.sol      # Manages staked ETH and yield
│   └── YieldMindAgent.sol     # Agent logic and task management
├── agent/
│   ├── index.ts               # Main agent loop
│   ├── chain.ts               # Blockchain interactions
│   ├── venice.ts              # Venice AI integration
│   ├── zyfai.ts               # Zyfai SDK integration
│   └── filecoin.ts            # Filecoin storage
├── frontend/                  # React web interface
│   ├── src/
│   │   ├── App.jsx           # Main application
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Contract ABIs and addresses
│   └── package.json
├── .env                       # Configuration
└── package.json               # Dependencies
```

---

## 🔧 How It Works

### 1. Treasury Management (YieldTreasury.sol)

- User deposits ETH
- On mainnet: ETH → stETH (Lido) → wstETH (wrapped)
- On testnet: Simulates 4% APY yield accrual
- Tracks principal separately from yield
- Only allows agent to spend yield

### 2. Agent Logic (YieldMindAgent.sol)

- Checks available yield before each task
- Pays for inference from yield (0.0001 ETH per task)
- Reverts if insufficient yield
- Logs all tasks on-chain

### 3. Off-Chain Agent (agent/index.ts)

- Monitors yield balance
- Requests tasks when yield is available
- Calls Venice AI for inference
- Stores results on Filecoin
- Updates on-chain task status

### 4. Integrations

- **Lido**: Staking yield source (mainnet)
- **Venice AI**: Private inference provider
- **Zyfai SDK**: Yield account management
- **Filecoin**: Decentralized storage for results

### 5. Frontend Dashboard

- **React + Vite**: Modern web interface
- **MetaMask Integration**: Wallet connection
- **Real-time Stats**: Treasury and yield monitoring
- **Deposit Interface**: Lock ETH as principal
- **Agent Monitoring**: View status and task history
- **Task History**: Track all agent activities with Filecoin CIDs

---

## 📚 Documentation

- `DEPLOY_NOW.md` - Detailed Remix deployment guide
- `QUICK_START.md` - Fast setup instructions
- `ERRORS_FIXED.md` - Troubleshooting common issues
- `INSTALL_FOUNDRY_WINDOWS.md` - Foundry installation for Windows
- `HOW_TO_GET_KEYS.md` - API key setup guide
- `ARCHITECTURE.md` - Technical architecture details

---

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Compile Contracts (Foundry)
```bash
forge build
```

### Run Agent
```bash
npm run agent
```

### Check Treasury Status
```bash
npm run status
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 🧪 Testing

The project includes a demo mode that works without external APIs:

- Venice AI: Falls back to mock responses
- Zyfai SDK: Uses mock yield account
- Filecoin: Generates mock CIDs

This allows you to test the full flow even without API keys.

---

## 🌐 Networks

### Base Sepolia (Testnet)
- RPC: `https://sepolia.base.org`
- Chain ID: `84532`
- Explorer: https://sepolia.basescan.org
- Faucet: https://www.alchemy.com/faucets/base-sepolia

### Base Mainnet (Production)
- RPC: `https://mainnet.base.org`
- Chain ID: `8453`
- Explorer: https://basescan.org

---

## 🔐 Security Notes

- ⚠️ Never commit real private keys to Git
- ⚠️ Use testnet-only keys for development
- ⚠️ The `.env` file is gitignored
- ⚠️ Audit contracts before mainnet deployment

---

## 🎥 Demo Video Script

1. **Show treasury deposit** (0:30)
   - Explain: "User deposits 0.1 ETH as principal"
   - Show: Transaction on Basescan

2. **Show agent running** (1:00)
   - Explain: "Agent checks yield, requests task, pays from yield only"
   - Show: Terminal output with yield balance

3. **Show on-chain verification** (0:30)
   - Explain: "Principal remains locked, only yield spent"
   - Show: Contract state on Basescan

4. **Explain innovation** (0:30)
   - "Self-sustaining AI agent funded by staking yield"
   - "Works indefinitely without additional funding"

---

## 🚧 Known Limitations

- **Testnet**: Simulates yield (4% APY) instead of real Lido staking
- **Zyfai**: SDK integration in mock mode (requires mainnet deployment)
- **Status Network**: Requires 0.01 ETH on mainnet for testnet access (skipped)

---

## 🔮 Future Enhancements

- [ ] Mainnet deployment with real Lido integration
- [ ] Frontend dashboard (skeleton in `frontend/index.html`)
- [ ] Multi-agent coordination
- [ ] Dynamic yield rebalancing
- [ ] DAO governance for agent parameters

---

## 📄 License

MIT

---

## 🤝 Contributing

This is a hackathon project. Feel free to fork and extend!

---

## 📞 Support

Check the documentation files for detailed guides:
- Deployment issues? → `DEPLOY_NOW.md`
- Errors? → `ERRORS_FIXED.md`
- Windows setup? → `INSTALL_FOUNDRY_WINDOWS.md`

---

## 🎯 Submission Checklist

- [x] Smart contracts deployed on Base Sepolia
- [x] Agent successfully runs and funds itself from yield
- [x] Code on GitHub
- [ ] Demo video recorded (2-3 minutes)
- [ ] Submit to Lido track
- [ ] Submit to Zyfai track

---

**Built for ETHGlobal Hackathon** | Targeting Lido + Zyfai tracks | $4,000+ in prizes
