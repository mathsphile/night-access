'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Globe,
  CheckCircle2,
  ExternalLink,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';

export default function ExplorerPage() {
  const { blockHeight, lastCommitment, visitorCount } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Midnight Network Explorer & Diagnostics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Real-time network telemetry and smart contract deployment status on the Midnight Preprod testnet.
        </p>
      </div>

      {/* Network Status Cards */}
      <div className="stats-grid" style={{ margin: 0 }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Network Status</span>
            <span className="status-dot"></span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--accent-emerald)' }}>
            ONLINE
          </div>
          <div className="stat-trend">
            <span>Midnight Preprod 0.20</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Latest Block</span>
            <Layers size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">#{blockHeight.toLocaleString()}</div>
          <div className="stat-trend">
            <span>Synchronized</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Verified Commitments</span>
            <Shield size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">{visitorCount.toLocaleString()}</div>
          <div className="stat-trend">
            <CheckCircle2 size={13} />
            <span>Active Admissions</span>
          </div>
        </div>
      </div>

      {/* Contract & Endpoints Detail Cards */}
      <div className="bento-grid" style={{ margin: 0 }}>
        <div className="card bento-col-6">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon">
                <Shield size={16} />
              </div>
              <span>Deployed Contract Artifacts</span>
            </div>
            <span className="card-badge">PREPROD</span>
          </div>

          <div className="status-list">
            <div className="status-box">
              <div className="status-box-header">Contract Address</div>
              <div className="status-box-value">0x7a29f8c14e32049b8529341f98d011c750a49e21</div>
            </div>

            <div className="status-box">
              <div className="status-box-header">Latest Verified Commitment</div>
              <div className="status-box-value" style={{ color: 'var(--text-primary)' }}>
                {lastCommitment}
              </div>
            </div>

            <div className="status-box">
              <div className="status-box-header">Proof Server Endpoint</div>
              <div className="status-box-value">http://127.0.0.1:6300 (Local Prover)</div>
            </div>
          </div>
        </div>

        <div className="card bento-col-6">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon">
                <Globe size={16} />
              </div>
              <span>Network Endpoints & Indexers</span>
            </div>
            <span className="card-badge">SERVICES</span>
          </div>

          <div className="status-list">
            <div className="status-box">
              <div className="status-box-header">Midnight Substrate RPC</div>
              <div className="status-box-value">wss://rpc.preprod.midnight.network</div>
            </div>

            <div className="status-box">
              <div className="status-box-header">Midnight GraphQL Indexer</div>
              <div className="status-box-value">https://indexer.preprod.midnight.network/api/v1/graphql</div>
            </div>

            <div className="status-box">
              <div className="status-box-header">Midnight Explorer UI</div>
              <div style={{ marginTop: '0.25rem' }}>
                <a
                  href="https://explorer.preprod.midnight.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>explorer.preprod.midnight.network</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
