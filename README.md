# Dantian Agent Certification

Time-bound certification for AI agents on 0G Chain. Certifications expire, forcing re-verification. Verify any agent, anywhere. Built by Dantian (dantian.io).

## Quick Start

```bash
# Install dependencies
npm install

# Copy env and add your private key
cp .env.example .env

# Get testnet tokens from https://faucet.0g.ai/

# Compile
npx hardhat compile

# Deploy to 0G testnet
npx hardhat run scripts/deploy.ts --network 0g-testnet

# Add the contract address to .env, then:

# Issue a certification
npx hardhat run scripts/certify.ts --network 0g-testnet

# Verify an agent
npx hardhat run scripts/verify.ts --network 0g-testnet
```

## Frontend

Open `frontend/index.html` in a browser. Update the `CONTRACT_ADDRESS` constant with your deployed address.

## Architecture

- **AgentCertifier.sol**: On-chain registry. Issues time-bound certs, supports verify/revoke.
- **0G Storage**: Full certification reports stored off-chain, hash on-chain.
- **Frontend**: Read-only verification. No wallet needed to check an agent.

## Certification Types

| Type | Code | Description |
|------|------|-------------|
| IDENTITY | 0 | Agent is who it claims to be |
| CAPABILITY | 1 | Agent can do what it claims |
| SAFETY | 2 | Agent passed safety checks |
| COMPLIANCE | 3 | Agent meets regulatory requirements |

## Why Time-Bound?

A diploma says "was good once." A medical license says "verified as of this date." Agents change. Models update. Weights drift. A permanent badge is meaningless for a system that mutates. Time-bound certification forces regular re-inspection. Trust stays current.

## Built For

Zero Coding Cannes Hackathon on 0G. By Jean Tremblay / Dantian (dantian.io).
