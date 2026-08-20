# Visitor Verification Platform (VVP)
> A privacy-preserving zero-knowledge visitor verification platform built on the Midnight Network using Compact smart contracts and Next.js 15.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel_Deployed-000000?style=flat-square&logo=vercel)](https://visitor-verification-platform.vercel.app/)
[![Midnight Preprod](https://img.shields.io/badge/Network-Midnight_Preprod-8b5cf6?style=flat-square)](https://explorer.preprod.midnight.network)
[![Next.js](https://img.shields.io/badge/Next.js-15.0_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Compact Language](https://img.shields.io/badge/Compact-v0.5.1-06b6d4?style=flat-square)](https://midnight.network)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 📄 Product Proposal & Architecture
- 📋 **Product Proposal Document**: [PROPOSAL.md](./PROPOSAL.md)
- 🎨 **UI Directory**: [`ui/`](./ui/) — Next.js 15 App Router with Minimal White Premium Design System, Lucide icons, and Client-side WebCrypto ZK Sandbox.

---

## 🛠️ Smart Contract Deployment Details

| Environment | Contract / Wallet Address | Status | Network Explorer |
|---|---|---|---|
| **Midnight Preprod Testnet** | `mn_addr_preprod1qlzf6h6zjhyms2p3y4vu5p278zqkqqaqk9nualrndghgxywseres5hth5u` | ✅ Deployed on Preprod | [Verify on Explorer](https://explorer.preprod.midnight.network) |
| **Local Standalone Node** | `0x8f2a91b4c3e7829a1059f3c706d4e8b21a309e45` | ✅ Deployed Local (`npm run deploy:local`) | Local Docker Standalone |
| **Live Web App (`ui`)** | `https://visitor-verification-platform.vercel.app/` | ✅ Active Production | [Open Live App](https://visitor-verification-platform.vercel.app/) |

---

## 🛡️ Midnight Privacy Model: What an Observer Learns vs Cannot Learn

### ❌ What an Observer CANNOT Learn (Kept Strictly Private):
1. **Raw Visitor Passcode**: The secret passcode string (`secretPasscode()`) is executed purely in local ZK witnesses and **never** transmitted to the network or stored in public state.
2. **Visitor Entropy Nonce**: The random entropy nonce (`visitorNonce()`) remains on the visitor's local device.
3. **Visitor Identity / Wallet Linking**: The Zero-Knowledge proof proves venue authorization without revealing personal identifiable information (PII) or unshielded credentials on-chain.
4. **Visitor Access Tier / Role Secret**: Visitor role claims (`visitorRole()`) are verified inside local ZK circuit constraints.

### ✅ What an Observer CAN Learn (Disclosed On-Chain Public State):
1. **Verified Visitor Count**: The aggregate counter (`visitorCount`) tracking total successful venue check-ins.
2. **Registered Venue Verifier ID**: The active venue identifier (`verifierId`) stored on the public ledger.
3. **Cryptographic Commitment Hash**: The disclosed persistent hash commitment (`lastVisitorCommitment`) representing a mathematically proven verification event.

---

## 🚀 Quickstart & Deployment Instructions

### 1. Installation
```bash
git clone https://github.com/INdrajit88/visitor-verification-platform.git
cd visitor-verification-platform
npm install
```

### 2. Fund Deployment Wallet (Midnight Preprod)
```bash
npm run wallet:funding
```
- Open the faucet: [https://midnight-tmnight-preprod.nethermind.dev/](https://midnight-tmnight-preprod.nethermind.dev/)
- Request test **tDUST / tNIGHT** tokens to your deployment wallet:
  `mn_addr_preprod1qlzf6h6zjhyms2p3y4vu5p278zqkqqaqk9nualrndghgxywseres5hth5u`

### 3. Deploy to Midnight Preprod
```bash
npm run deploy:preprod
```

### 4. Deploy Locally (Standalone Simulation)
```bash
npm run deploy:local
```

### 5. Launch Modern Next.js UI
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Validation
Run automated unit tests:
```bash
npm test
```