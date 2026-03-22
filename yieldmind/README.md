# YieldMind

YieldMind is a yield-powered AI agent on Base Sepolia.

The product idea is simple:

- a user deposits ETH into a treasury
- the treasury keeps principal locked
- yield accrues separately from principal
- the agent spends only yield to fund AI execution
- the run is recorded through on-chain task history plus Filecoin proof

## What It Does

YieldMind combines:

- `Base Sepolia` for the live contract layer
- `Lido-style yield modeling` for the treasury mechanic on testnet
- `Venice AI` for inference
- `Filecoin` for execution record storage
- `Zyfai` as the yield-account integration direction
- `Status Network` as the gasless execution target

Current execution flow:

1. User deposits ETH into `YieldTreasury`
2. Principal remains locked
3. Spendable yield becomes available over time
4. `YieldMindAgent` requests a task and pays from yield
5. Venice generates the response
6. The execution record is written to Filecoin
7. Completion is written back on-chain

## Project Status

What is real in the current build:

- Base Sepolia treasury and agent contracts
- on-chain task request / completion flow
- live frontend connected to the backend API
- Venice inference integration
- Filecoin logging with a local proof fallback when remote upload is unavailable

What is still simulated or partial:

- Lido is modeled as a 4% APY treasury simulation on testnet
- Zyfai is integrated directionally, but not fully proven as a transaction-complete funding rail
- Status Network is represented as the target execution rail, not the default live backend path

There is no demo mode in the current app flow. If yield is insufficient, the task should wait or fail honestly.

## Repository Structure

```text
yieldmind/
├─ agent/                   Off-chain agent logic and integrations
├─ contracts/               Solidity contracts
├─ frontend/                React + Vite UI
├─ scripts/                 Deployment, funding, and status scripts
├─ server/                  Express API for live status, history, and task execution
├─ .env.example             Environment template
├─ hardhat.config.ts        Hardhat configuration
├─ package.json             Backend / contract scripts
└─ README.md
```

## Main Contracts

- `contracts/YieldTreasury.sol`
  Keeps principal locked, simulates yield on testnet, and allows only the agent to spend yield.

- `contracts/YieldMindAgent.sol`
  Registers tasks, checks available yield, pays from the treasury, and stores completion metadata.

## Main App Surfaces

- `frontend/src/App.jsx`
  App shell, contract polling, backend polling, and stat merging.

- `frontend/src/components/Dashboard.jsx`
  Product overview and sponsor-proof summary.

- `frontend/src/components/AgentStatus.jsx`
  Live execution flow, task trigger, and integration health.

- `frontend/src/components/History.jsx`
  Execution records, proofs, and transaction history.

- `server/index.ts`
  `/status`, `/history`, and `/run-task` backend API.

## Local Setup

### 1. Install dependencies

From the project root:

```bash
npm install
```

From the frontend folder:

```bash
cd frontend
npm install
```

### 2. Configure environment

Create `.env` from `.env.example` and set:

- `PRIVATE_KEY`
- `BASE_SEPOLIA_RPC`
- `TREASURY_ADDRESS`
- `AGENT_ADDRESS`
- `VENICE_API_KEY`
- optional Filecoin and Zyfai keys

### 3. Build the backend / scripts

```bash
npm run build
```

### 4. Start the backend API

The frontend expects the backend on `3011`.

```bash
set YIELDMIND_SERVER_PORT=3011
npm run server
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

Open:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3011/status`

## Useful Commands

From `yieldmind/`:

```bash
npm run build
npm run deploy
npm run fund
npm run status
npm run agent
npm run server
```

From `yieldmind/frontend/`:

```bash
npm run dev
npm run build
```

## How to Make the Agent Runnable

The agent can run only when treasury yield is above the deployed `INFERENCE_COST`.

If the UI says the agent is waiting:

- add more principal with `npm run fund`
- wait for additional yield accrual
- confirm the backend is running on port `3011`
- refresh the frontend so it picks up the current backend state

## Notes

- Minimum treasury deposit in the contract is `0.001 ETH`
- The current testnet treasury simulates yield rather than using real Lido staking
- Filecoin can fall back to a local proof file if remote upload credentials are unavailable
- Frontend and backend should be kept on the same contract addresses

## Security

- never commit real private keys
- use testnet wallets for development
- audit contracts before any mainnet deployment

## License

MIT
