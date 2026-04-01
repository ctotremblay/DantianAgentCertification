# Dantian Agent Certification

Time-bound certification for AI agents on 0G Chain. Certifications expire. Agents must be re-verified to stay certified. Trust stays current or it disappears.

**Contract:** [`0x5C1dc7Daf8774C963c28c7487365fc7e4AeA4065`](https://chainscan-galileo.0g.ai/address/0x5C1dc7Daf8774C963c28c7487365fc7e4AeA4065) on 0G Galileo Testnet

## The Problem

AI agents claim things. "I can summarize documents." "I handle PII safely." "I speak Japanese." There is no standard way to verify those claims on-chain, and no mechanism to ensure they remain true over time.

A diploma says "was good once." A medical license says "verified as of this date." Agents change. Models update. Weights drift. A permanent badge is meaningless for a system that mutates.

## What This Does

Dantian Agent Certification is an on-chain registry where authorized certifiers can issue, verify, and revoke time-bound certifications for any AI agent. Each certification includes:

- A **type** (identity, capability, safety, or compliance)
- An **expiry date** (30 days, 90 days, whatever the certifier sets)
- A **report hash** pointing to the full inspection evidence

When a certification expires, the agent is no longer certified. Period. Re-inspection is required.

## Certification Reports

Every certification is backed by a structured JSON report that documents exactly what was tested. Reports follow a [defined schema](report-schema.json) and contain:

**Skill verification.** Each skill the agent claims is tested individually. The report records the prompt sent, the expected behavior, the actual response, the response time, and a pass/fail/partial verdict with a numeric score.

**Safety checks.** Three categories: jailbreak resistance (how many attempts, how many breaches), PII handling (does it redact sensitive data), and boundary respect (does it refuse actions outside its scope).

**Verdict.** An overall score, how many skills passed out of how many claimed, and a summary paragraph explaining the certification decision.

**Inspection metadata.** When the inspection happened, how it was conducted, how long it took, and the environment used.

Reports are uploaded to 0G Storage. The keccak256 hash is stored on-chain. Anyone can verify that a report matches what was certified. The frontend can load and display full reports inline.

### Example

An agent claims 5 skills. The certifier tests each one with a specific prompt, records what happened, runs safety probes, and produces a report. The report says 4/5 skills passed, all safety checks passed, overall score 87/100. That report gets hashed and anchored on-chain alongside the certification.

## Agent Identity

Agents do not need a wallet to be certified. The system accepts four identifier types:

| Format | Example | Resolution |
|--------|---------|------------|
| Wallet address | `0x1234...abcd` | Used directly |
| GitHub repo | `github:owner/repo` or `https://github.com/owner/repo` | Hashed to deterministic address |
| API endpoint | `api:https://agent.example.com` or `https://agent.example.com` | Hashed to deterministic address |
| Agent name | `my-agent-v2` | Hashed to deterministic address |

The same identifier always resolves to the same on-chain address. `github:dantian-ai/research-assistant` will produce the same address whether you type it in the frontend, pass it to a script, or compute it yourself. The logic is in [`scripts/agent-id.ts`](scripts/agent-id.ts) and mirrored in the frontend.

## Certification Types

| Type | Code | What It Means |
|------|------|---------------|
| IDENTITY | 0 | Agent is who it claims to be |
| CAPABILITY | 1 | Agent can do what it claims |
| SAFETY | 2 | Agent passed safety checks |
| COMPLIANCE | 3 | Agent meets regulatory requirements |

An agent can hold multiple certifications of different types simultaneously.

## Architecture

```
AgentCertifier.sol          On-chain registry. Issues, verifies, revokes certs.
    |
    |--- reportHash         keccak256 of the full JSON report
    |--- uri                Pointer to report on 0G Storage
    |
0G Storage                  Full certification reports stored off-chain
    |
Frontend                    Read-only verification page. No wallet needed.
    |--- agent-id resolver  Any identifier -> deterministic address
    |--- report viewer      Loads full report JSON, renders inline
```

**Contract.** `AgentCertifier.sol` stores certifications as structs with agent address, certifier address, type, timestamps, report hash, and URI. Supports certify, verify, verifyByType, revoke, and bulk queries.

**Reports.** JSON files following `report-schema.json`. Uploaded to 0G Storage, hash stored on-chain. Frontend loads reports by hash from `frontend/reports/` and renders skill scores, safety results, and verdicts inline.

**Frontend.** Static HTML page at `frontend/index.html`. Connects to 0G Galileo via ethers.js. Accepts any agent identifier, resolves it, queries the contract, and displays all active certifications with optional full report expansion.

## Quick Start

```bash
npm install

cp .env.example .env
# Add your private key and contract address

# Get testnet tokens: https://faucet.0g.ai/
```

### Deploy

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network 0g-testnet
```

### Certify an Agent

```bash
# Simple certification (no report)
npx hardhat run scripts/certify.ts --network 0g-testnet

# Full certification with structured report and 0G Storage upload
AGENT_ID="github:owner/repo" npx hardhat run scripts/certify-with-report.ts --network 0g-testnet
```

`AGENT_ID` accepts any format: wallet address, GitHub repo, API URL, or plain name.

### Verify

```bash
npx hardhat run scripts/verify.ts --network 0g-testnet
```

Or open `frontend/index.html` in a browser and paste any agent identifier.

### List Certifications

```bash
npx hardhat run scripts/list-certs.ts --network 0g-testnet
```

### Revoke

```bash
npx hardhat run scripts/revoke.ts --network 0g-testnet
```

## Scripts

| Script | Purpose |
|--------|---------|
| `deploy.ts` | Deploy AgentCertifier to 0G testnet |
| `certify.ts` | Issue a basic certification |
| `certify-with-report.ts` | Generate report, upload to 0G Storage, certify |
| `verify.ts` | Check if an agent is certified |
| `list-certs.ts` | List all certifications for an agent |
| `revoke.ts` | Revoke a certification early |
| `agent-id.ts` | Agent identifier resolution library |

## Frontend

Open `frontend/index.html` directly in a browser. No build step. No wallet required to verify.

The frontend resolves any identifier type, queries the contract, and shows:
- Active certification count and status
- Each certification with type, certifier, dates, and expiry countdown
- Full inspection reports (if available) with expandable skill details, safety results, and verdicts

## Stack

- Solidity 0.8.24 (Hardhat)
- TypeScript scripts
- 0G Chain (Galileo Testnet)
- 0G Storage (report persistence)
- ethers.js v6
- Static HTML/CSS/JS frontend

## Built For

Zero Coding Cannes Hackathon on 0G. By Jean Tremblay / Dantian.
