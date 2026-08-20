'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function InspectorPage() {
  const { showToast } = useApp();

  const codeString = `pragma language_version >= 0.20;

import CompactStandardLibrary;

export enum State { vacant, occupied }

export ledger currentVerifier: Bytes<32>;
export ledger lastCommitment: Bytes<32>;
export ledger totalVisitors: Uint<32>;

witness getPasscodeWitness(verifier: Bytes<32>): Bytes<32>;

export circuit verifyVisitor(verifier: Bytes<32>, salt: Bytes<32>): [] {
    // Ensure the target venue verifier matches current on-chain state
    assert verifier == currentVerifier;

    // Retrieve private passcode from local witness runtime
    const witnessPasscode = getPasscodeWitness(verifier);

    // Compute cryptographic commitment hash in Zero-Knowledge
    const computedCommitment = persistent_hash<Vector<3, Bytes<32>>>(
        [witnessPasscode, verifier, salt]
    );

    // Disclose commitment hash to ledger and increment visitor count
    lastCommitment = computedCommitment;
    totalVisitors = totalVisitors + 1;
}

export circuit resetVerifier(newVerifier: Bytes<32>): [] {
    currentVerifier = newVerifier;
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    showToast('Circuit code copied to clipboard!', 'success');
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Compact Zero-Knowledge <span className="gradient-text">Circuit Inspector</span>
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
          Inspect the Compact smart contract syntax, private witness logic, and verification constraints.
        </p>
      </div>

      <div className="card card-glow-pink">
        <div className="card-header">
          <div className="card-title">
            <div className="card-icon">🔍</div>
            <span>Compact ZK Circuit (contract/src/bboard.compact)</span>
          </div>
          <button
            onClick={handleCopy}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            📋 Copy Code
          </button>
        </div>

        <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          The Compact circuit below uses multi-input persistent hashing to verify visitor credentials against registered venue parameters without exposing private witnesses.
        </p>

        <pre className="code-block"><code>{codeString}</code></pre>
      </div>
    </>
  );
}
