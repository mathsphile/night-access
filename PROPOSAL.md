# Product Proposal: Visitor Verification Platform (VVP)

> **Category**: Zero-Knowledge Privacy dApp (Midnight Idea List)  
> **Target Network**: Midnight Preprod Testnet  
> **Preprod Contract Address**: `0x7a29f8c14e32049b8529341f98d011c750a49e21`  
> **Local Contract Address**: `0x8f2a91b4c3e7829a1059f3c706d4e8b21a309e45` (`npm run deploy:local`)  
> **Frontend Stack**: 100% Vanilla TypeScript inside `vvp-ui/` (HTML5, Vanilla CSS, Vite, TS ES Modules)

---

## 📌 Executive Summary
The **Visitor Verification Platform (VVP)** is an enterprise-grade, privacy-preserving access control solution built on the Midnight Network using Compact smart contracts. 

VVP enables physical and digital venues (corporations, secure facilities, government sites, VIP events) to verify visitors' authorization and passcodes via **Zero-Knowledge (ZK) proofs**—without ever revealing the visitor's raw passcode, entropy nonces, or personal wallet identity on the public ledger.

---

## 🎯 Problem Statement
Traditional physical visitor registration and access control systems suffer from severe privacy and security drawbacks:
1. **Exposure of Sensitive Data**: Visitors must hand over raw passcodes, government IDs, or personal contact details to venue front desks.
2. **On-Chain Identity Tracking**: In Web3 access systems, submitting a transaction to claim or verify access ties the user's public wallet address directly to physical check-in locations and timestamps.
3. **Data Leak Risks**: Centralized visitor databases are prone to data breaches and insider abuse.

---

## 💡 Proposed Solution & Architecture
VVP solves these challenges by utilizing Midnight's dual-state (private witness vs. public ledger) architecture:

```
+-----------------------------------------------------------------------------------+
|                              VISITOR LOCAL DEVICE                                 |
|                                                                                   |
|  [ Secret Passcode ]  +  [ Visitor Nonce ]  +  [ Role Access Key ]                 |
|                            │                                                      |
|                            ▼                                                      |
|                 ( Local ZK Witness Execution )                                    |
|                            │                                                      |
|                            ▼                                                      |
|                 [ Zero-Knowledge Proof (ZK-SNARK) ]                                |
+----------------------------┬------------------------------------------------------+
                             │ Submit Proof
                             ▼
+-----------------------------------------------------------------------------------+
|                        MIDNIGHT PREPROD TESTNET LEDGER                            |
|                                                                                   |
|  [ Verified Visitor Count: +1 ]  |  [ Disclosed Commitment Hash ]                 |
|  ( Zero PII Revealed )           |  ( State Updated )                             |
+-----------------------------------------------------------------------------------+
```

1. **Local ZK Witness Computation**: The visitor inputs their venue secret passcode and role claims into their local browser environment.
2. **Zero-Knowledge Proof Generation**: Midnight's Compact circuit executes locally inside the visitor's browser or proof server, producing a cryptographic proof.
3. **Public Ledger Update**: The Midnight smart contract verifies the ZK proof on-chain, incrementing the verified visitor count and emitting a cryptographic commitment hash—without recording any visitor identity or raw passcode.

---

## 🛡️ Midnight Privacy Model Breakdown

### ❌ What an Observer CANNOT Learn (Kept Strictly Private):
* **Raw Visitor Passcode**: The secret string (`secretPasscode()`) is executed purely in local ZK witnesses and is **never** transmitted across the network or stored in public state.
* **Visitor Entropy Nonce**: The random entropy nonce (`visitorNonce()`) remains isolated on the visitor's device.
* **Visitor Identity / Wallet Linking**: The Zero-Knowledge proof proves venue authorization without revealing personal identifiable information (PII) or unshielded credentials on-chain.
* **Visitor Access Tier / Role Secret**: Visitor role claims (`visitorRole()`) are verified strictly inside local ZK circuit constraints.

### ✅ What an Observer CAN Learn (Disclosed On-Chain Public State):
* **Verified Visitor Count**: The aggregate counter (`visitorCount`) tracking total successful venue check-ins.
* **Registered Venue Verifier ID**: The active venue identifier (`verifierId`) stored on the public ledger.
* **Cryptographic Commitment Hash**: The disclosed persistent hash commitment (`lastVisitorCommitment`) representing a mathematically proven verification event.

---

## 💻 Tech Stack & Compliance
* **Smart Contract**: Midnight Compact Language (`contracts/counter.compact` / `vvp/contract`)
* **Frontend**: **100% Vanilla TypeScript** (HTML5, Vanilla CSS, Vite, ES Modules — **No React/Vue/Angular**)
* **Wallet Integration**: Midnight Lace Wallet Browser Extension DApp Connector v4 API (`window.midnight.mnLace`)
* **Testing**: Vitest unit test suite (9 unit tests passing)
* **Deployment**: Live on Vercel & Midnight Preprod Testnet

---

## 🔗 Verification Links
* **Live Demo URL**: [https://visitor-verification-platform.vercel.app/](https://visitor-verification-platform.vercel.app/)
* **YouTube Demo Video**: [https://youtu.be/rCD3mMkdK7A](https://youtu.be/rCD3mMkdK7A)
* **GitHub Repository**: [https://github.com/INdrajit88/visitor-verification-platform](https://github.com/INdrajit88/visitor-verification-platform)
* **Preprod Contract Address**: `0x7a29f8c14e32049b8529341f98d011c750a49e21`
