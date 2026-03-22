# YieldMind

> **Yield-powered AI execution on Base Sepolia** — your principal stays locked, your yield pays for intelligence.

YieldMind is an on-chain AI agent that funds its own inference using accrued yield — never touching the user's deposited principal. Every execution is recorded on-chain and proven via Filecoin, creating a fully auditable, self-sustaining AI loop.

---

## How It Works

```
User deposits ETH
       │
       ▼
 YieldTreasury (Base Sepolia)
  ├─ Principal → locked forever
  └─ Yield → accrues over time
                │
                ▼
        YieldMindAgent
         checks yield ≥ INFERENCE_COST
                │
                ▼
         Venice AI (inference)
                │
                ▼
      Filecoin execution record
                │
                ▼
    On-chain task completion written
```

1. **Deposit** — User deposits ETH into `YieldTreasury`. Principal is locked.
2. **Yield accrual** — Yield accumulates separately (Lido-style model on testnet).
3. **Task request** — `YieldMindAgent` checks available yield and registers a task.
4. **Inference** — Venice AI generates the response, funded entirely from yield.
5. **Proof** — The execution record is written to Filecoin (with local fallback).
6. **Completion** — Result and proof CID are committed back on-chain.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart contracts | Base Sepolia (Solidity + Hardhat) |
| Yield model | Lido-style simulation (testnet) |
| AI inference | Venice AI |
| Execution proofs | Filecoin (+ local fallback) |
| Yield account integration | Zyfai |
| Gasless execution target | Status Network |
| Frontend | React + Vite |
| Backend API | Express (Node.js / TypeScript) |

---

## Project Status

The following are **live and functional** in the current build:

- ✅ Base Sepolia treasury and agent contracts deployed
- ✅ On-chain task request / completion flow
- ✅ Live frontend connected to the backend API
- ✅ Venice inference integration
- ✅ Filecoin logging with local proof fallback

> **No demo mode exists.** If yield is insufficient, the agent waits or fails honestly — there is no simulated success path.

---

## Repository Structure

```
yieldmind/
├─ agent/          Off-chain agent logic and integrations
├─ contracts/      Solidity contracts
├─ frontend/       React + Vite UI
├─ scripts/        Deployment, funding, and status scripts
├─ server/         Express API (status, history, task execution)
├─ .env.example    Environment variable template
├─ hardhat.config.ts
└─ package.json
```

---

## Contracts

### `YieldTreasury.sol`
Holds deposited ETH, keeps principal locked, simulates yield accrual on testnet, and exposes a yield-spend interface callable only by the registered agent.

### `YieldMindAgent.sol`
Registers task requests, checks that available yield covers `INFERENCE_COST`, deducts from the treasury, and stores completion metadata (response hash + Filecoin CID) on-chain.

---

## Frontend & Backend

| Surface | File | Purpose |
|---|---|---|
| App shell | `frontend/src/App.jsx` | Contract polling, backend polling, stat merging |
| Dashboard | `frontend/src/components/Dashboard.jsx` | Product overview, integration proof summary |
| Agent status | `frontend/src/components/AgentStatus.jsx` | Live execution flow, task trigger, health checks |
| History | `frontend/src/components/History.jsx` | Execution records, proofs, transaction log |
| API server | `server/index.ts` | `/status`, `/history`, `/run-task` endpoints |

---

## Local Setup

### 1. Install dependencies

```bash
# From project root
npm install

# Frontend
cd frontend && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Required variables:

```env
PRIVATE_KEY=
BASE_SEPOLIA_RPC=
TREASURY_ADDRESS=
AGENT_ADDRESS=
VENICE_API_KEY=
```

Optional:

```env
FILECOIN_API_KEY=
ZYFAI_API_KEY=
```

### 3. Build

```bash
npm run build
```

### 4. Start the backend

The frontend expects the backend on port **3011**.

```bash
set YIELDMIND_SERVER_PORT=3011
npm run server
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3011/status |

---

## CLI Reference

From `yieldmind/`:

| Command | Description |
|---|---|
| `npm run build` | Compile TypeScript |
| `npm run deploy` | Deploy contracts to Base Sepolia |
| `npm run fund` | Add principal to the treasury |
| `npm run status` | Print current yield and agent state |
| `npm run agent` | Run the off-chain agent loop |
| `npm run server` | Start the Express API |

From `yieldmind/frontend/`:

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |

---

## Agent Not Running?

The agent executes only when `availableYield ≥ INFERENCE_COST`. If the UI shows the agent is waiting:

1. Run `npm run fund` to increase principal (yield accrues faster with more principal)
2. Wait for additional yield to accrue
3. Confirm the backend is running on port `3011`
4. Refresh the frontend to pick up the latest state

---

## Security

- **Never commit real private keys.** Use `.env` and ensure it is in `.gitignore`.
- Use testnet wallets only during development.
- Audit contracts thoroughly before any mainnet deployment.
- The agent wallet should hold only the ETH needed for gas — not user funds.

---

## License

MIT
