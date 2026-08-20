# Product Proposal: Night Access (VVP)

> **Category**: Zero-Knowledge Privacy dApp  
> **Track**: Midnight Idea List — Real-World Privacy Infrastructure  
> **Network**: Midnight Preprod Testnet  
> **Status**: ✅ Smart contract deployed and verified on-chain

---

## 🧠 Executive Summary

**Night Access (VVP)** is an enterprise-grade, privacy-preserving access control system built on the Midnight Network.

Night Access enables physical and digital venues — corporations, secure facilities, government buildings, VIP events — to verify that a visitor is authorized, without ever recording *who* that visitor is, *what* their passcode is, or *which wallet* they hold.

> Zero knowledge of identity. Full certainty of authorization.

This is possible because Midnight's Compact language executes ZK witness computation locally on the user's device. Only a cryptographic proof crosses the network boundary. The ledger learns the aggregate result — never the raw inputs.

---

## 🎯 The Problem

Traditional physical visitor registration and Web3 access control suffer from two compounding problems:

| Problem | Impact |
|---|---|
| Visitors hand over raw passcodes or government IDs | Centralized breach risk; insider abuse |
| Web3 on-chain check-ins link wallet → physical location | Permanent, public surveillance record |
| Centralized access databases | Single point of failure; GDPR exposure |

**None of these problems are technical limitations of blockchain itself — they are failures of design.** Midnight's dual-state architecture (private witnesses + public ledger) directly solves them.

---

## 💡 Solution Architecture

VVP uses Midnight's Compact ZK circuit model:

```
┌─────────────────────────────────────────────────────────┐
│                  VISITOR'S LOCAL BROWSER                │
│                                                         │
│  Secret Passcode + Random Nonce + Role Access Key       │
│         │                                               │
│         ▼  (none of these ever leave the device)        │
│  ┌──────────────────────────────────┐                   │
│  │  Compact ZK Circuit (WASM)       │                   │
│  │  - secretPasscode() witness      │  ← proof server   │
│  │  - visitorNonce() witness        │    localhost:6300  │
│  │  - visitorRole() witness         │                   │
│  └──────────────┬───────────────────┘                   │
│                 │  ZK-SNARK proof only                  │
└─────────────────┼───────────────────────────────────────┘
                  │  submitted to chain
                  ▼
┌─────────────────────────────────────────────────────────┐
│              MIDNIGHT PREPROD LEDGER                    │
│                                                         │
│  PUBLIC STATE (visible to all):                         │
│  ✅ visitorCount      — aggregate check-in counter      │
│  ✅ lastCommitment    — cryptographic commitment hash   │
│  ✅ verifierId        — venue identifier                │
│                                                         │
│  PRIVATE (never stored, never transmitted):             │
│  ❌ secretPasscode    — raw passcode string             │
│  ❌ visitorNonce      — entropy nonce                   │
│  ❌ visitorRole       — access tier / role key          │
│  ❌ wallet address    — visitor identity                │
└─────────────────────────────────────────────────────────┘
```

### How It Works — Step by Step

1. **Local Witness Computation**: The visitor inputs their venue passcode and role claims locally. Compact's witness functions (`secretPasscode()`, `visitorNonce()`, `visitorRole()`) execute entirely in-browser or via a local proof server.

2. **ZK Proof Generation**: The Midnight proof server (running in Docker at `localhost:6300`) generates a ZK-SNARK proof that the visitor satisfies the contract's authorization constraints.

3. **On-Chain Verification**: The Compact smart contract verifies the proof on the Midnight Preprod ledger, increments the visitor counter, and emits a commitment hash — **without recording any PII, passcode, or wallet linkage**.

---

## 🔗 Deployed Contracts

| Deployment | Contract Address | Explorer |
|---|---|---|
| **✅ Midnight Preprod (latest)** | `d235cebe33a0824447cd77650534966fca23a7e9810199a74ab42a1e1bff2460` | [View on Preprod Explorer →](https://explorer.preprod.midnight.network/contracts/d235cebe33a0824447cd77650534966fca23a7e9810199a74ab42a1e1bff2460) |
| **✅ Midnight Preprod (initial)** | `63c22f7ea758ea8983ee76c76eb4a65b3956ee9af41fe8d2e32b9fa89b1c4790` | [View on Preprod Explorer →](https://explorer.preprod.midnight.network/contracts/63c22f7ea758ea8983ee76c76eb4a65b3956ee9af41fe8d2e32b9fa89b1c4790) |
| **✅ Local Standalone** | `0x8f2a91b4c3e7829a1059f3c706d4e8b21a309e45` | Local Docker node |

**Deployment Wallet**: `mn_addr_preprod1qlzf6h6zjhyms2p3y4vu5p278zqkqqaqk9nualrndghgxywseres5hth5u`

---

## 🛡️ Midnight Privacy Model — What Is and Isn't Revealed

### ❌ What an Observer CANNOT Learn

| Private Data | Why It Stays Private |
|---|---|
| Raw visitor passcode | Executed in local ZK witness; never serialized to any network message |
| Visitor entropy nonce | Ephemeral; generated and consumed locally per session |
| Visitor identity / wallet address | ZK proof contains no wallet binding or signature linkage |
| Access tier / role secret | Verified inside circuit constraints; not in public ledger state |

### ✅ What an Observer CAN Learn

| Public Data | Description |
|---|---|
| Verified visitor count | Aggregate integer counter — no linkage to individual visitors |
| Cryptographic commitment hash | Deterministic proof fingerprint — no PII derivable |
| Venue verifier ID | The registered venue identifier set by the operator |

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contract** | Midnight Compact Language — zero-knowledge circuit DSL |
| **ZK Proving** | Midnight Proof Server `8.1.0` (Docker) — WASM-based proving |
| **Node Client** | Polkadot.js API + `@midnight-ntwrk/*` SDK packages |
| **Frontend** | Next.js 15 App Router, Vanilla CSS, TypeScript |
| **Wallet** | Midnight Lace DApp Connector v4 (`window.midnight.mnLace`) |
| **Testing** | Vitest (unit tests) |
| **Hosting** | Vercel (UI) + Midnight Preprod (contract) |

---

## 🌐 Use Cases

| Sector | Application |
|---|---|
| **Corporate HQ** | Employee and contractor visitor sign-in without recording identity |
| **Government / Defense** | Clearance-level venue access with zero surveillance residue |
| **VIP Events** | Ticket or credential verification without linking wallet to attendance |
| **Healthcare** | Patient or staff access control compliant with HIPAA/GDPR privacy requirements |
| **Financial Services** | KYC-compliant access gates without storing PII on public ledgers |

---

## 🔗 Verification Links

| Resource | Link |
|---|---|
| 🚀 Live Demo | [visitor-verification-platform.vercel.app](https://visitor-verification-platform.vercel.app/) |
| 🎬 Demo Video | [youtu.be/rCD3mMkdK7A](https://youtu.be/rCD3mMkdK7A) |
| 📦 GitHub Repository | [github.com/mathsphile/night-access](https://github.com/mathsphile/night-access) |
| 🔍 Contract (latest) | [Preprod Explorer — d235cebe...](https://explorer.preprod.midnight.network/contracts/d235cebe33a0824447cd77650534966fca23a7e9810199a74ab42a1e1bff2460) |
| 🔍 Contract (initial) | [Preprod Explorer — 63c22f7e...](https://explorer.preprod.midnight.network/contracts/63c22f7ea758ea8983ee76c76eb4a65b3956ee9af41fe8d2e32b9fa89b1c4790) |
