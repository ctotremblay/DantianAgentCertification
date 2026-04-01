# Dantian Agent Certification: Time-Bound Verification on 0G

## Hackathon Submission: Zero Coding Cannes

**Project:** Dantian Agent Certification
**Team:** Jean Tremblay (Dantian / dantian.io)
**Date:** April 1, 2026

---

## One-Liner

On-chain, time-bound certification for AI agents. Verify any agent, anywhere, with an expiry date that forces re-verification. Built on 0G.

## Relation to Original Blueprint

The original 0G Vibe Code Blueprint (Agent Audit Trail) focused on logging every agent action to 0G Storage for transparency. This project is the evolution: instead of just logging actions, we certify agents themselves. The audit trail concept lives on as the certification report stored in 0G Storage. Logging is one input to certification. Certification is the trust output.

Both projects serve the same Dantian mission: human-synthetic integration requires verifiable trust.

---

## Problem

AI agents are proliferating. Nobody can tell which ones are real, capable, or safe. Current approaches either:
- Issue permanent badges (worthless after the agent changes)
- Rely on self-reported claims (no verification)
- Only work within one platform (not portable)

There is no standard way to say: "This agent was verified as [capable/real/safe] on [date], and that certification expires on [date]."

## Solution: Dantian Agent Certification

A decentralized certification registry on 0G Chain where:

1. **Certifiers** (auditors, platforms, DAOs) issue time-bound certifications to agent addresses
2. **Certifications expire** at a set date, forcing re-inspection
3. **Anyone, anywhere** can verify an agent's certification status by querying the contract
4. **Certification reports** are stored on 0G Storage (immutable, tamper-proof), with only the hash on-chain
5. **Multiple certification types**: identity, capability, safety, compliance

### Why Time-Bound?

A diploma says "was good once." A medical license says "verified as of [date]." Agents change. Models update. Weights drift. A permanent badge is meaningless for a system that mutates. Time-bound certification forces:
- Regular re-inspection (platform stickiness)
- Fresh verification data (trust stays current)
- Revenue from recurring certification fees

### Why 0G?

| 0G Component | How We Use It |
|--------------|---------------|
| **0G Chain** | Smart contract registry. EVM-compatible. Sub-second finality for real-time verification queries. |
| **0G Storage** | Store full certification reports (JSON). Immutable. Merkle-verified. Only the 32-byte hash goes on-chain. |
| **0G Compute** | Run AI-powered verification checks via decentralized GPUs (certifier agent inference). |
| **INFTs (ERC-7857)** | Future: wrap certifications as transferable intelligent NFTs with encrypted audit data. |

---

## Architecture

```
                    CERTIFIER                          VERIFIER (anyone)
                       |                                    |
                       v                                    v
              [Certification Report]              [Query by agent address]
                       |                                    |
                       v                                    v
              +------------------+                +------------------+
              |   0G Storage     |                |   0G Chain       |
              |   (full report)  |                |   (contract)     |
              |   returns: hash  |                |   returns:       |
              +--------+---------+                |   - certified?   |
                       |                          |   - cert type    |
                       v                          |   - expires when |
              +------------------+                |   - report hash  |
              |   0G Chain       |                |   - certifier    |
              |   AgentCertifier |                +------------------+
              |   .certify(      |
              |     agent,       |                +------------------+
              |     type,        |                |  Light Auditor   |
              |     expiry,      |  <-- reads --> |  (read-only)     |
              |     reportHash   |                |  Generates       |
              |   )              |                |  Critical Reports|
              +------------------+                +------------------+
```

### Smart Contract: AgentCertifier.sol

**Core functions:**
- `certify(agent, certType, expiryTimestamp, reportHash, uri)` -- Issue certification
- `verify(agent)` -- Check if agent has valid (non-expired) certification
- `getCertification(agent, certId)` -- Get full certification details
- `getActiveCertifications(agent)` -- List all active certs for an agent
- `revoke(agent, certId)` -- Revoke a certification early
- `isCertifier(address)` -- Check if address is authorized certifier

**Certification types (extensible):**
- `0` = IDENTITY (agent is who it claims to be)
- `1` = CAPABILITY (agent can do what it claims)
- `2` = SAFETY (agent passed safety checks)
- `3` = COMPLIANCE (agent meets regulatory requirements)

### Two Agents

| Agent | Role | Model | Access |
|-------|------|-------|--------|
| **Certifier Agent** | Full auditor. Runs skill tests, safety probes, generates reports, issues on-chain certs. | Claude 3.5 Sonnet | Read + Write (on-chain + storage) |
| **Light Auditor** | Consumer-facing. Summarizes existing reports into Critical Reports. No testing. | Claude 3.5 Haiku | Read-only (reports + on-chain status) |

The Light Auditor is completely separate from the Certifier Agent. It cannot issue, modify, or revoke certifications. It reads existing data and generates summaries.

---

## Pricing Model

See `PRICING.md` for full cost model with margin analysis.

### For Agent Builders (Supply Side)

| Tier | Price | Duration | What They Get |
|------|-------|----------|---------------|
| Single Certification | $49 | 30 days | Full audit, report, on-chain cert, leaderboard listing |
| Continuous: 3 months | $79 | 3 months | Daily automated re-audit, always-current certification |
| Continuous: 6 months | $149 | 6 months | Same as above, lower per-month cost |
| Continuous: 12 months | $249 | 12 months | Same as above, lowest per-month cost |

Single Certification: agent pays once, gets audited, certification lasts 30 days. After that, it expires. Pay again for re-certification.

Continuous Certification: agent pays upfront. Dantian monitors the agent every 24 hours. If it passes daily re-audit, the certification rolls forward. If it fails, certification is revoked immediately. No refund for remaining prepaid time.

### For Users (Demand Side)

| Product | Price | What They Get |
|---------|-------|---------------|
| Verification check | Free | Is this agent certified? Score? Expiry? |
| Critical Report | $4 | Plain-language summary, trust score, recommendation, downloadable |

### Cost Model Summary

| Product | Cost per Unit | Revenue | Gross Margin |
|---------|--------------|---------|--------------|
| Tier 1 (full audit + human review) | $12.81 | $49 | 73.9% |
| Tier 2 (daily re-check, per month) | $5.17 | $20.75-$26.33 | 75-80% |
| Critical Report | $0.005 | $4 | 99.9% |

All products meet the 70% minimum gross margin target.

---

## Build Plan (This Afternoon)

### Phase 1: Contract + Deploy (1.5h)
1. Scaffold Hardhat project with 0G testnet config
2. Write AgentCertifier.sol
3. Write deploy script
4. Get testnet tokens from faucet
5. Deploy to 0G Galileo testnet

### Phase 2: Scripts (1h)
1. certify.ts -- Issue a test certification
2. verify.ts -- Check certification status
3. revoke.ts -- Revoke a certification
4. certifier-agent.ts -- Automated evaluation pipeline
5. agent-id.ts -- Universal identifier resolution

### Phase 3: Frontend (1.5h)
1. Landing page: search bar, featured agents, trust verification
2. Leaderboard: ranked agents by trust score, filtered by category
3. Submit page: agent builders submit for certification
4. Agent profile: full report display with expandable skill details

### Phase 4: Storage Integration (1h)
1. Upload certification reports to 0G Storage
2. Register the hash on-chain
3. Frontend loads and displays reports

### Phase 5: Demo Data (1h)
1. 20 demo agents across 10 categories
2. 3 agents with real, evidence-based reports (web research, cited sources)
3. Full range of outcomes: certified, denied, warnings, expired

---

## What We Built (Hackathon Deliverables)

- [x] `AgentCertifier.sol` deployed on 0G Galileo Testnet
- [x] Universal agent identity resolution (wallet, GitHub, API, name)
- [x] Structured certification report schema with skill-level evidence
- [x] Certifier Agent (`scripts/certifier-agent.ts`) with multi-LLM support
- [x] 20 demo agents with full reports
- [x] 3 real, evidence-based reports (aixbt, Truth Terminal, Virtuals Protocol)
- [x] Static frontend: landing page, leaderboard, submit flow, agent profiles
- [x] Pricing model with cost calculations and margin analysis
- [x] Light Auditor specification and Critical Report schema
- [x] Submission configs showing the evidence-to-report pipeline

## Future Upgrades (Post-Hackathon)

### v2: Light Auditor Deployment
- Deploy Light Auditor as serverless function
- Stripe integration for $4 Critical Report payments
- PDF/HTML export for Critical Reports
- 24-hour cache for generated reports

### v3: Continuous Certification Engine
- Always-on cron service for Tier 2 daily re-audits
- Automated expiry extension on passing re-audit
- Automated revocation on failure with email notification
- Dashboard for agent owners to monitor certification status

### v4: INFT Certification Tokens
- Wrap certifications as ERC-7857 INFTs
- Encrypted audit data travels with the token
- Agents can prove certification to any platform by holding the INFT

### v5: 0G Compute Integration
- Run certifier agent inference on 0G decentralized GPUs
- TEE-verified evaluation for tamper-proof certification
- Cost reduction through decentralized compute vs. centralized API

### v6: Cross-Chain Verification
- Deploy verification relayers on Ethereum, Solana, Base
- Any chain can query 0G for agent certification status
- Bridges certification from 0G to wherever agents operate

### v7: DAO Governance
- Certifier reputation system
- Community votes on certification standards
- Stake-weighted certifier authorization
- Certification marketplace with competing certifiers

---

## 0G Tools Used

- [x] 0G Chain (smart contract deployment + verification queries)
- [x] 0G Storage (certification report storage)
- [x] 0G CC MCP (development tooling, compute inference testing)
- [ ] 0G Compute (future: decentralized certifier agent inference)
- [ ] iNFT (future: certification tokens)
- [ ] 0G DA (future: data availability for cross-chain)

---

## Submission Checklist

- [ ] Project title + description on vibe-event.fly.dev
- [ ] GitHub repo with working code
- [x] Contract deployed on 0G testnet
- [ ] Frontend hosted with live demo
- [ ] Wallet address for prizes
- [x] Pricing model documented
- [x] Cost model with margin analysis
- [x] Real agent reports with cited sources
