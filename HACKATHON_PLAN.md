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
| **0G Compute** | Future: run AI-powered verification checks against agents using decentralized GPUs. |
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
              |     agent,       |
              |     type,        |
              |     expiry,      |
              |     reportHash   |
              |   )              |
              +------------------+
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

### Phase 3: Frontend (1.5h)
1. Single HTML page: paste an agent address, see certification status
2. Connects to 0G testnet via ethers.js in browser
3. Shows: certified/not certified, type, expiry date, certifier, report link
4. Hosted on GitHub Pages or Vercel for the demo

### Phase 4: Storage Integration (1h)
1. Upload a sample certification report JSON to 0G Storage
2. Register the hash on-chain
3. Frontend links to stored report

---

## Future Upgrades (Post-Hackathon)

### v2: INFT Certification Tokens
- Wrap certifications as ERC-7857 INFTs
- Encrypted audit data travels with the token
- Agents can prove certification to any platform by holding the INFT

### v3: AI-Powered Verification
- Use 0G Compute to run automated checks against agents
- LLM-based capability testing (send tasks, evaluate responses)
- Safety probes (jailbreak tests, boundary checks)
- Results stored on 0G Storage, hash on-chain

### v4: Cross-Chain Verification
- Deploy verification relayers on Ethereum, Solana, Base
- Any chain can query 0G for agent certification status
- Bridges certification from 0G to wherever agents operate

### v5: DAO Governance
- Certifier reputation system
- Community votes on certification standards
- Stake-weighted certifier authorization

### v6: Certification Marketplace
- Certifiers compete on price and quality
- Agents shop for certifications
- Revenue split: platform fee + certifier fee

---

## 0G Tools Used

- [x] 0G Chain (smart contract deployment + verification queries)
- [x] 0G Storage (certification report storage)
- [ ] 0G Compute (future: AI-powered verification)
- [ ] 0G CC MCP (development tooling)
- [ ] iNFT (future: certification tokens)
- [ ] 0G DA (future: data availability for cross-chain)

---

## Submission Checklist

- [ ] Project title + description on vibe-event.fly.dev
- [ ] GitHub repo with working code
- [ ] Contract deployed on 0G testnet
- [ ] Frontend hosted with live demo
- [ ] Wallet address for prizes
