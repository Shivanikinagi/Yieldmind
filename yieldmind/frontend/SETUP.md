# Frontend Setup Instructions

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to http://localhost:5173

## If npm install fails

Try installing dependencies one by one:

```bash
npm install react@^18.2.0 react-dom@^18.2.0
npm install ethers@^5.8.0
npm install -D vite@^5.0.0 @vitejs/plugin-react@^4.2.1
```

## Requirements

- Node.js 16 or higher
- npm 7 or higher

## Troubleshooting

### "Cannot find module"
Run `npm install` again

### "Port 5173 already in use"
Kill the process or use a different port:
```bash
npm run dev -- --port 3000
```

### "MetaMask not detected"
Install MetaMask browser extension

### "Wrong network"
Switch to Base Sepolia in MetaMask
