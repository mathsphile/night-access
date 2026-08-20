'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Shield,
  Activity,
  Users,
  Cpu,
  Zap,
  CheckCircle2,
  Copy,
  Sliders,
  Globe,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    visitorCount,
    lastCommitment,
    venueId,
    blockHeight,
    visitorRecords,
    showToast,
  } = useApp();

  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    showToast('Commitment hash copied to clipboard', 'info');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Operations & Telemetry Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Real-time monitoring of zero-knowledge visitor verification on Midnight Preprod.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/checkin" className="btn-primary" style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}>
            <Zap size={14} />
            <span>New Check-In</span>
          </Link>
          <Link href="/admin" className="btn-secondary" style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}>
            <Sliders size={14} />
            <span>Gate Settings</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid" style={{ margin: 0 }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Verified</span>
            <Users size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">{visitorCount.toLocaleString()}</div>
          <div className="stat-trend">
            <CheckCircle2 size={13} />
            <span>Active Admissions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Prover Latency</span>
            <Zap size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">
            385<span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>ms</span>
          </div>
          <div className="stat-trend">
            <span>⚡ Sub-second ZK proving</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Circuit Constraints</span>
            <Cpu size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">1,420</div>
          <div className="stat-trend">
            <span>Poseidon / SHA-256</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Midnight Node</span>
            <Globe size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">#{blockHeight.toLocaleString()}</div>
          <div className="stat-trend">
            <span className="status-dot"></span>
            <span>Preprod Live</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Visitor Stream Table & Telemetry */}
      <div className="bento-grid" style={{ margin: 0 }}>
        {/* Visitor Stream Table (8 Cols) */}
        <div className="card bento-col-8">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon">
                <Activity size={16} />
              </div>
              <span>Real-Time Visitor Stream</span>
            </div>
            <span className="card-badge">LIVE LEDGER</span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1rem' }}>
            Zero-knowledge cryptographic commitments settled on the Midnight Preprod blockchain.
          </p>

          <div className="table-container">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Venue Gate</th>
                  <th>Commitment Hash</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {visitorRecords.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{v.timestamp}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.venueId}</td>
                    <td>
                      <button
                        type="button"
                        className="hash-pill"
                        onClick={() => copyToClipboard(v.commitment)}
                        title="Click to copy hash"
                      >
                        <span>
                          {v.commitment.substring(0, 10)}...{v.commitment.substring(v.commitment.length - 6)}
                        </span>
                        <Copy size={11} color="var(--text-muted)" />
                      </button>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {v.type}
                      </span>
                    </td>
                    <td>
                      <span className="badge-verified">
                        <CheckCircle2 size={11} />
                        <span>Verified</span>
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{v.latencyMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Telemetry & Gate Configuration (4 Cols) */}
        <div className="bento-col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active Gate Verifier */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <Shield size={16} />
                </div>
                <span>Gate Configuration</span>
              </div>
            </div>

            <div className="status-list">
              <div className="status-box">
                <div className="status-box-header">Active Venue Verifier</div>
                <div className="status-box-value">{venueId}</div>
              </div>
              <div className="status-box">
                <div className="status-box-header">Contract Address</div>
                <div className="status-box-value" style={{ fontSize: '0.8rem' }}>
                  0x7a29f8c14e32049b8529341f98d011c750a49e21
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <Link href="/admin" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.84rem' }}>
                <span>Configure Gate ID</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Compact ZK Diagnostics */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <Cpu size={16} />
                </div>
                <span>Circuit Diagnostics</span>
              </div>
            </div>

            <div className="status-list">
              <div className="status-box">
                <div className="status-box-header">Prover Framework</div>
                <div className="status-box-value">Compact VM • Halo2 / KZG</div>
              </div>
              <div className="status-box">
                <div className="status-box-header">Gas / Transaction Cost</div>
                <div className="status-box-value" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  0.0012 tDUST (Midnight Preprod)
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Link href="/inspector" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                <span>Inspect Compact Circuit</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
