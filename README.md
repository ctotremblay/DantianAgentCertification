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

## Pricing

Two-sided marketplace. Agent builders pay for certification. Users verify for free.

### For Agent Builders

| Tier | Price | Duration | How It Works |
|------|-------|----------|-------------|
| **Single Certification** | $49 | 30 days | Full audit. One report. Certification expires after 30 days. Pay again to re-certify. |
| **Continuous: 3 months** | $79 | 3 months | Automated re-audit every 24 hours. Certification rolls forward daily. |
| **Continuous: 6 months** | $149 | 6 months | Same daily re-audit cycle. Lower per-month cost. |
| **Continuous: 12 months** | $249 | 12 months | Lowest per-month cost. $20.75/month. |

**Single Certification** is the default entry. One price, one scope, one month. No upsell.

**Continuous Certification** monitors the agent every 24 hours. If it passes, the certification stays active. If it fails, certification is revoked immediately. No refund for remaining prepaid time. The selling point: "Certified as of today, not as of last month."

### For Users

| Product | Price | What You Get |
|---------|-------|-------------|
| **Verification check** | Free | Is this agent certified? What score? When does it expire? |
| **Critical Report** | $4 | Plain-language summary, trust score, recommendation, downloadable PDF |

Verification is always free. It is the public utility layer.

The Critical Report is a human-readable summary for trust decisions. It does not re-run the audit. It reads the existing certification data and produces a one-page summary with a clear recommendation: safe, use with caution, or not recommended.

See [`PRICING.md`](PRICING.md) for full cost model with margin analysis.

## Certification Reports

Every certification is backed by a structured JSON report that documents exactly what was tested. Reports follow a [defined schema](report-schema.json) and contain:

**Skill verification.** Each skill the agent claims is tested individually. The report records the prompt sent, the expected behavior, the actual response, the response time, and a pass/fail/partial verdict with a numeric score.

**Safety checks.** Three categories: jailbreak resistance (how many attempts, how many breaches), PII handling (does it redact sensitive data), and boundary respect (does it refuse actions outside its scope).

**Verdict.** An overall score, how many skills passed out of how many claimed, and a summary paragraph explaining the certification decision.

**Inspection metadata.** When the inspection happened, how it was conducted, how long it took, and the environment used.

Reports are uploaded to 0G Storage. The keccak256 hash is stored on-chain. Anyone can verify that a report matches what was certified. The frontend can load and display full reports inline.

### Example

An agent claims 5 skills. The certifier tests each one with a specific prompt, records what happened, runs safety probes, and produces a report. The report says 4/5 skills passed, all safety checks passed, overall score 87/100. That report gets hashed and anchored on-chain alongside the certification.

## Two Agents

The system uses two separate agents with different access levels.

### Certifier Agent (Full Auditor)

Runs the full evaluation pipeline. Analyzes agent source code, tests claimed skills with structured prompts, runs safety probes, generates the certification report, uploads to 0G Storage, and issues the on-chain certification.

- **Model:** Claude 3.5 Sonnet (quality matters for certification decisions)
- **Access:** Read + Write (on-chain contract, 0G Storage)
- **Cost:** ~$0.30 per audit (LLM only); $12.81 including human review for Tier 1
- **Code:** [`scripts/certifier-agent.ts`](scripts/certifier-agent.ts)
- **Input:** Agent submission config with pre-gathered evidence
- **Output:** Full certification report (JSON, follows `report-schema.json`)
- **LLM backends:** 0G Compute (preferred), Anthropic API, OpenAI API

### Light Auditor (Consumer Reports)

Read-only agent that generates Critical Reports from existing certification data. No new testing. Reads and summarizes.

- **Model:** Claude 3.5 Haiku (cost-optimized for summarization)
- **Access:** Read-only (reports + on-chain status). Cannot issue, modify, or revoke certifications.
- **Cost:** $0.005 per Critical Report
- **Code:** [`light-auditor/`](light-auditor/)
- **Input:** Agent identifier + most recent full report + on-chain status
- **Output:** Critical Report (JSON, follows `critical-report-schema.json`)

See [`light-auditor/README.md`](light-auditor/README.md) for the full specification.

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
Certifier Agent             Full auditor. Tests agents, generates reports.
    |                       Writes to contract + storage.
    |
Light Auditor               Read-only. Generates Critical Reports from
    |                       existing data. No write access.
    |
Frontend                    Verification (free) + Critical Reports ($4)
    |--- agent-id resolver  Any identifier -> deterministic address
    |--- report viewer      Loads full report JSON, renders inline
    |--- critical report    Summarized trust report for consumers
```

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

# Automated certification via the Certifier Agent
npx ts-node scripts/certifier-agent.ts ./scripts/submissions/aixbt.json
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
| `certifier-agent.ts` | Automated evaluation pipeline (LLM-powered) |
| `verify.ts` | Check if an agent is certified |
| `list-certs.ts` | List all certifications for an agent |
| `revoke.ts` | Revoke a certification early |
| `agent-id.ts` | Agent identifier resolution library |

## Frontend

Open `frontend/index.html` directly in a browser. No build step. No wallet required to verify.

**Pages:**
- **Landing** (`index.html`) -- Search bar, featured agents, trust verification
- **Leaderboard** (`leaderboard.html`) -- Ranked agents by trust score, filtered by category
- **Submit** (`submit.html`) -- Agent builders submit for certification with tier selection
- **Agent Profile** (`agent.html`) -- Full report display with expandable skill details

The frontend resolves any identifier type, queries the contract, and shows:
- Active certification count and status
- Each certification with type, certifier, dates, and expiry countdown
- Full inspection reports (if available) with expandable skill details, safety results, and verdicts

## Demo Data

20 agents across 10 categories (marketing, support, dev-tools, finance, legal, research, sales, general, crypto).

Three agents have **real, evidence-based reports** with cited sources:
- **aixbt** (score 65, denied) -- Accuracy disputed (31-83%), $106K security breach, undisclosed Virtuals bias
- **Truth Terminal** (score 43, denied) -- Autonomy claims false, $602K hack, $2B+ market influence without disclaimers
- **Virtuals Protocol** (score 66, certified with warnings) -- BasisOS fraud ($500K theft), quality assurance failure

Sources cited in reports: BeInCrypto, CryptoBriefing, Decrypt, CoinDesk, Yahoo Finance, CoinTelegraph, CoinBureau.

## Stack

- Solidity 0.8.24 (Hardhat)
- TypeScript scripts
- 0G Chain (Galileo Testnet)
- 0G Storage (report persistence)
- ethers.js v6
- Static HTML/CSS/JS frontend

## Built For

Zero Coding Cannes Hackathon on 0G. By Jean Tremblay / Dantian.
