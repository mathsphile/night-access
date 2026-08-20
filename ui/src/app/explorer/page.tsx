'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function ExplorerPage() {
  const { showToast } = useApp();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Midnight Preprod <span className="gradient-text">Network Diagnostics</span>
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
          On-chain smart contract addresses, block explorer endpoints, and network health parameters.
        </p>
      </div>

      <div className="card card-glow-cyan">
        <div className="card-header">
          <div className="card-title">
            <div className="card-icon">🌐</div>
            <span>Midnight Network State & Explorer</span>
          </div>
        </div>

        <div className="status-list">
          <div className="status-box">
            <div className="status-box-header">Deployed Compact Contract Address</div>
            <div
              className="status-box-value"
              style={{ color: 'var(--cyan-400)', cursor: 'pointer' }}
              onClick={() => handleCopy('0x7a29f8c14e32049b8529341f98d011c750a49e21')}
              title="Click to copy"
            >
              0x7a29f8c14e32049b8529341f98d011c750a49e21
            </div>
          </div>

          <div className="status-box">
            <div className="status-box-header">Midnight Preprod Block Explorer</div>
            <div className="status-box-value">
              <a
                href="https://explorer.preprod.midnight.network"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--watermelon-400)', fontWeight: 700, textDecoration: 'none' }}
              >
                https://explorer.preprod.midnight.network ↗
              </a>
            </div>
          </div>

          <div className="status-box">
            <div className="status-box-header">Proof Server Endpoint (Local & Remote)</div>
            <div className="status-box-value" style={{ color: 'var(--slate-300)', fontSize: '0.88rem' }}>
              http://127.0.0.1:6300 (Standalone / Docker Compose)
            </div>
          </div>

          <div className="status-box">
            <div className="status-box-header">Network Status & Node Sync</div>
            <div style={{ color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className="status-dot"></span>
              <span>Online & Receiving Zero-Knowledge State Transitions</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
