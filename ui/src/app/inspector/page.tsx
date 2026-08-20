'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Code2, Copy, CheckCircle2, Shield, Cpu } from 'lucide-react';

export default function InspectorPage() {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const circuitCode = `// contracts/bboard.compact
// Midnight Zero-Knowledge Visitor Verification Circuit

pragma language_version >= 0.20.0;

import CompactStandardLibrary;

export enum AccessTier {
    Standard,
    VIP,
    Staff
}

export ledger activeVenueId: Cell<Bytes<32>>;
export ledger totalVerifiedVisitors: Counter;
export ledger latestCommitment: Cell<Bytes<32>>;

witness getVisitorPasscode(verifier: Bytes<32>): Bytes<32>;

export circuit verifyVisitorAccess(
    targetVerifier: Bytes<32>,
    nonceSalt: Bytes<32>,
    expectedCommitment: Bytes<32>
): [] {
    // Retrieve secret passcode witness locally from visitor runtime
    const witnessSecret = getVisitorPasscode(targetVerifier);

    // Compute cryptographic commitment in Zero-Knowledge
    const calculatedHash = persistent_hash<Vector<3, Bytes<32>>>([
        witnessSecret,
        targetVerifier,
        nonceSalt
    ]);

    // Assert commitment validity without revealing witnessSecret
    assert calculatedHash == expectedCommitment
        "Invalid visitor credentials for requested venue";

    // Atomically increment verified count and record public commitment
    totalVerifiedVisitors.increment(1);
    latestCommitment.write(expectedCommitment);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(circuitCode);
    setCopied(true);
    showToast('Circuit code copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Compact Circuit Inspector
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Inspect the underlying Zero-Knowledge smart contract deployed to the Midnight VM.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={copyCode}
          style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
        >
          {copied ? <CheckCircle2 size={14} color="#16a34a" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy Compact Contract'}</span>
        </button>
      </div>

      {/* Code Inspector Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-icon">
              <Code2 size={16} />
            </div>
            <span>bboard.compact</span>
          </div>
          <span className="card-badge">COMPACT v0.20</span>
        </div>

        <pre className="code-block" style={{ fontSize: '0.84rem', lineHeight: 1.65 }}>
          <code>{circuitCode}</code>
        </pre>
      </div>

      {/* Explanatory Specs Cards */}
      <div className="stats-grid" style={{ margin: 0 }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Witness Function</span>
            <Shield size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            getVisitorPasscode()
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Never broadcast over network; evaluated locally in WASM.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">ZK Hash Function</span>
            <Cpu size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            persistent_hash&lt;Vector&gt;
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Zero-knowledge friendly Poseidon hash algorithm.
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Ledger State</span>
            <Code2 size={16} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Cell&lt;Bytes&lt;32&gt;&gt;
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Atomic commitment updates verified by Midnight nodes.
          </div>
        </div>
      </div>
    </div>
  );
}
