'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const { visitorCount, lastCommitment, venueId, visitorRecords, blockHeight, showToast } = useApp();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <>
      {/* Top Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Venue Verification <span className="gradient-text">Operations Dashboard</span>
          </h1>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
            Real-time Zero-Knowledge visitor streams, Compact circuit telemetry, and venue gate controllers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/checkin" className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}>
            <span>+</span> New Visitor Check-In
          </Link>
          <Link href="/admin" className="btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}>
            <span>🏛️</span> Gate Settings
          </Link>
        </div>
      </div>

      {/* Top KPI Metric Cards */}
      <section className="stats-grid" style={{ margin: '0 0 2rem 0' }}>
        <div className="stat-card card-glow-pink">
          <div className="stat-header">
            <span className="stat-label">Total Verified Accesses</span>
            <div className="stat-icon-wrap">🛡️</div>
          </div>
          <div className="stat-value">{visitorCount.toLocaleString()}</div>
          <div className="stat-trend">
            <span>↑ +14.2%</span>
            <span style={{ color: 'var(--slate-500)', fontWeight: 500 }}>active today</span>
          </div>
        </div>

        <div className="stat-card card-glow-cyan">
          <div className="stat-header">
            <span className="stat-label">Active Venue Verifiers</span>
            <div className="stat-icon-wrap">🏛️</div>
          </div>
          <div className="stat-value">
            3 <span style={{ fontSize: '1rem', color: 'var(--slate-400)' }}>Venues</span>
          </div>
          <div className="stat-trend" style={{ color: 'var(--cyan-400)' }}>
            <span>● Gate A & VIP Active</span>
          </div>
        </div>

        <div className="stat-card card-glow-emerald">
          <div className="stat-header">
            <span className="stat-label">Avg Prover Time</span>
            <div className="stat-icon-wrap">⚡</div>
          </div>
          <div className="stat-value">
            385<span style={{ fontSize: '1.1rem', color: 'var(--emerald-400)' }}>ms</span>
          </div>
          <div className="stat-trend">
            <span>✓ Sub-second latency</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Midnight Preprod Block</span>
            <div className="stat-icon-wrap">🌐</div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.7rem', color: 'var(--cyan-400)' }}>
            #{blockHeight.toLocaleString()}
          </div>
          <div className="stat-trend">
            <span className="status-dot"></span>
            <span>Node Synchronized</span>
          </div>
        </div>
      </section>

      {/* Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.75rem' }}>
        {/* Sidebar */}
        <aside style={{
          background: 'var(--bg-glass-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          height: 'fit-content',
          position: 'sticky',
          top: '90px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
            Navigation
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <a href="#overview" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.2), rgba(255, 51, 102, 0.05))',
              border: '1px solid rgba(255, 51, 102, 0.35)',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              <span>📊</span> Overview
            </a>
            <a href="#visitorStream" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--slate-300)',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              <span>⚡</span> Real-time Stream
            </a>
            <a href="#zkTelemetry" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--slate-300)',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              <span>🛡️</span> ZK Telemetry
            </a>
            <Link href="/checkin" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--slate-300)',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              <span>🔑</span> Check-In Terminal
            </Link>
            <Link href="/admin" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--slate-300)',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              <span>🏛️</span> Venue Admin
            </Link>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255, 51, 102, 0.08)', border: '1px solid rgba(255, 51, 102, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--watermelon-400)', marginBottom: '0.25rem' }}>
              Midnight Lace
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', lineHeight: 1.4 }}>
              Zero-knowledge DApp Connector integration enabled.
            </div>
          </div>
        </aside>

        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Live Visitor Stream Table Card */}
          <div className="card card-glow-pink" id="visitorStream">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">⚡</div>
                <span>Live Visitor Access Stream</span>
              </div>
              <span className="card-badge" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--emerald-400)', borderColor: 'rgba(16,185,129,0.3)' }}>
                LIVE FEED
              </span>
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Real-time feed of zero-knowledge visitor verifications with cryptographic commitment hashes.
            </p>

            <div className="table-container">
              <table className="watermelon-table">
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>Timestamp</th>
                    <th>Venue Gate</th>
                    <th>On-Chain Commitment Hash</th>
                    <th>Access Tier</th>
                    <th>Status</th>
                    <th>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {visitorRecords.map(record => (
                    <tr key={record.id}>
                      <td style={{ fontWeight: 700, color: '#ffffff' }}>{record.id}</td>
                      <td style={{ color: 'var(--slate-400)' }}>{record.timestamp}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--slate-300)' }}>
                          {record.venueId}
                        </span>
                      </td>
                      <td>
                        <div
                          className="hash-pill"
                          onClick={() => handleCopy(record.commitment)}
                          title="Click to copy commitment hash"
                        >
                          <span>{record.commitment.substring(0, 14)}...</span>
                          <span style={{ fontSize: '0.7rem' }}>📋</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-300)' }}>
                          {record.type}
                        </span>
                      </td>
                      <td>
                        <span className="badge-verified">
                          <span style={{ width: '6px', height: '6px', background: 'var(--emerald-500)', borderRadius: '50%' }}></span>
                          Verified
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--emerald-400)', fontSize: '0.8rem' }}>
                        {record.latencyMs}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ZK Circuit Performance Telemetry */}
          <div className="card card-glow-cyan" id="zkTelemetry">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">🔍</div>
                <span>Midnight Compact ZK Circuit Telemetry</span>
              </div>
              <span className="card-badge">CONTRACT VERIFIED</span>
            </div>

            <p style={{ color: 'var(--slate-400)', fontSize: '0.88rem' }}>
              Cryptographic execution statistics across the Midnight Proof Server and compact smart contract.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: 'rgba(10, 14, 24, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 700, textTransform: 'uppercase' }}>Circuit Constraints</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>1,420</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', marginTop: '0.2rem' }}>✓ Ultra-lightweight SNARK</div>
              </div>

              <div style={{ background: 'rgba(10, 14, 24, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 700, textTransform: 'uppercase' }}>Prover Memory Footprint</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>32.4 <span style={{ fontSize: '0.9rem', color: 'var(--slate-400)' }}>MB</span></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cyan-400)', marginTop: '0.2rem' }}>✓ Browser WASM Compatible</div>
              </div>

              <div style={{ background: 'rgba(10, 14, 24, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 700, textTransform: 'uppercase' }}>Gas Consumption</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>0.0012 <span style={{ fontSize: '0.9rem', color: 'var(--slate-400)' }}>tDUST</span></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', marginTop: '0.2rem' }}>✓ Minimal On-Chain Fee</div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <pre className="code-block"><code>{`// Active Circuit: verifyVisitor(verifier: Bytes<32>, salt: Bytes<32>)
// Prover: Midnight ZK Prover 4.0 (Halo2/KZG Commitments)
// Contract Address: 0x7a29f8c14e32049b8529341f98d011c750a49e21
// Verifier Key Hash: 0xd9e29a01f7823b49e102fba781190bc2`}</code></pre>
            </div>
          </div>

          {/* Active Gate Controller */}
          <div className="card card-glow-emerald">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">🏛️</div>
                <span>Active Venue Gate Status</span>
              </div>
              <Link href="/admin" className="btn-secondary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}>
                Full Admin Console →
              </Link>
            </div>

            <div className="status-list">
              <div className="status-box">
                <div className="status-box-header">Current Active Venue ID</div>
                <div className="status-box-value" style={{ color: 'var(--watermelon-400)', fontWeight: 700 }}>
                  {venueId}
                </div>
              </div>
              <div className="status-box">
                <div className="status-box-header">Last Registered Commitment</div>
                <div
                  className="status-box-value"
                  style={{ color: 'var(--cyan-400)', cursor: 'pointer' }}
                  onClick={() => handleCopy(lastCommitment)}
                >
                  {lastCommitment}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
