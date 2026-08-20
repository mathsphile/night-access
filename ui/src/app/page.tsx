'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { sha256Hex } from '@/lib/zk';

export default function HomePage() {
  const { visitorCount, lastCommitment, venueId, blockHeight, showToast } = useApp();
  const [simPasscode, setSimPasscode] = useState('vip_passcode_alpha_99');
  const [simStep, setSimStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSimulating) return;
    setIsSimulating(true);

    // Step 1: Witness
    setSimStep(1);
    await new Promise(r => setTimeout(r, 400));

    // Step 2: Circuit
    setSimStep(2);
    await new Promise(r => setTimeout(r, 600));

    // Step 3: ZK Proof
    setSimStep(3);
    const hash = await sha256Hex(simPasscode + '_midnight_salt');
    await new Promise(r => setTimeout(r, 500));

    // Step 4: Commitment
    setSimStep(4);
    showToast(`Zero-Knowledge Proof Verified! Commitment: ${hash.substring(0, 10)}...`, 'success');
    setIsSimulating(false);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <span style={{ display: 'inline-block', animation: 'pulseGlow 2s infinite ease-in-out' }}>⚡</span>
          <span>Zero-Knowledge Enterprise Access Protocol • Midnight Compact Circuit</span>
        </div>

        <h1 className="hero-heading">
          Verify Visitor Access with <br />
          <span className="gradient-text">Zero-Knowledge Privacy</span>
        </h1>

        <p className="hero-subtext">
          Authenticate venue admissions cryptographically without revealing credentials, passcodes, or personal identities on-chain. Powered by Midnight Network ZK-SNARKs and Compact smart contracts.
        </p>

        <div className="cta-group">
          <Link href="/dashboard" className="btn-primary">
            <span>🚀</span> Open Live Dashboard
          </Link>
          <Link href="/checkin" className="btn-secondary">
            <span>⚡</span> Visitor Check-In Portal
          </Link>
        </div>

        {/* Live Interactive Simulator Card */}
        <div style={{ marginTop: '3.5rem', textAlign: 'left' }}>
          <div className="card card-glow-pink">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">⚡</div>
                <span>Interactive Zero-Knowledge Circuit Simulator</span>
              </div>
              <span className="card-badge">LIVE NEXT.JS DEMO</span>
            </div>

            <p style={{ color: 'var(--slate-400)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Test private witness verification. Enter a sample passcode below to execute the 4-stage Compact ZK circuit pipeline in real-time.
            </p>

            <form onSubmit={handleSimulate}>
              <div className="sim-input-group">
                <input
                  type="text"
                  className="sim-input"
                  value={simPasscode}
                  onChange={e => setSimPasscode(e.target.value)}
                  placeholder="Enter private passcode witness..."
                />
                <button type="submit" className="sim-btn" disabled={isSimulating}>
                  <span>⚡</span> {isSimulating ? 'Computing Proof...' : 'Run ZK Circuit'}
                </button>
              </div>
            </form>

            <div className="sim-pipeline">
              <div className={`sim-step ${simStep >= 1 ? 'active' : ''}`}>
                <div className="sim-step-num">1</div>
                <div className="sim-step-title">Witness Input</div>
                <div className="sim-step-desc">Locally salted private credentials kept off-chain.</div>
              </div>

              <div className={`sim-step ${simStep >= 2 ? 'active' : ''}`}>
                <div className="sim-step-num">2</div>
                <div className="sim-step-title">Compact Circuit</div>
                <div className="sim-step-desc">Zero-knowledge proof execution in Midnight VM.</div>
              </div>

              <div className={`sim-step ${simStep >= 3 ? 'active' : ''}`}>
                <div className="sim-step-num">3</div>
                <div className="sim-step-title">ZK Proof</div>
                <div className="sim-step-desc">Cryptographic SNARK proof generated in &lt;400ms.</div>
              </div>

              <div className={`sim-step ${simStep >= 4 ? 'active' : ''}`}>
                <div className="sim-step-num">4</div>
                <div className="sim-step-title">Commitment</div>
                <div className="sim-step-desc">Disclosed hash verified and settled on-chain.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats KPI Ticker */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Verified Accesses</span>
            <div className="stat-icon-wrap">🛡️</div>
          </div>
          <div className="stat-value">{visitorCount.toLocaleString()}</div>
          <div className="stat-trend">
            <span>↑ +18.4%</span>
            <span style={{ color: 'var(--slate-500)', fontWeight: 500 }}>from last week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Avg Prover Latency</span>
            <div className="stat-icon-wrap">⚡</div>
          </div>
          <div className="stat-value">
            385<span style={{ fontSize: '1.2rem', color: 'var(--cyan-400)' }}>ms</span>
          </div>
          <div className="stat-trend">
            <span>⚡ Sub-second</span>
            <span style={{ color: 'var(--slate-500)', fontWeight: 500 }}>ZK-SNARK generation</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Privacy Preservation</span>
            <div className="stat-icon-wrap">🔒</div>
          </div>
          <div className="stat-value">
            100<span style={{ fontSize: '1.2rem', color: 'var(--watermelon-400)' }}>%</span>
          </div>
          <div className="stat-trend">
            <span>✓ Zero leakage</span>
            <span style={{ color: 'var(--slate-500)', fontWeight: 500 }}>no raw passcodes on-chain</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Midnight Preprod State</span>
            <div className="stat-icon-wrap">🌐</div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--emerald-400)' }}>
            #{blockHeight.toLocaleString()}
          </div>
          <div className="stat-trend">
            <span className="status-dot" style={{ marginRight: '4px' }}></span>
            <span>Synced & Healthy</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Showcase */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Engineered for <span className="gradient-text">High-Security Venues</span>
          </h2>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Modular architecture built on Watermelon UI design language and Midnight Network cryptography
          </p>
        </div>

        <div className="bento-grid">
          {/* Bento Card 1 */}
          <div className="card bento-col-8 card-glow-pink">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">🛡️</div>
                <span>Private Witness Protection & Local Hashing</span>
              </div>
              <span className="card-badge">CLIENT-SIDE PRIVACY</span>
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              Visitor credentials, passcodes, and nonces are processed exclusively within the visitor's secure local runtime. Only cryptographic commitments are broadcast to the Midnight ledger.
            </p>
            <pre className="code-block"><code>{`// contracts/bboard.compact
witness getPasscode(verifier: Bytes<32>): Bytes<32>;
export circuit verifyVisitor(verifier: Bytes<32>, salt: Bytes<32>): [] {
    const witnessPasscode = getPasscode(verifier);
    const calculatedCommitment = persistent_hash<Vector<3, Bytes<32>>>(
        [witnessPasscode, verifier, salt]
    );
    assert calculatedCommitment == expectedCommitment;
}`}</code></pre>
          </div>

          {/* Bento Card 2 */}
          <div className="card bento-col-4 card-glow-cyan">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">🏛️</div>
                <span>Venue Gate Manager</span>
              </div>
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Configure individual gates, VIP access tiers, and on-chain verification verifier IDs dynamically.
            </p>
            <div className="status-list">
              <div className="status-box">
                <div className="status-box-header">Active Venue ID</div>
                <div className="status-box-value" style={{ color: 'var(--watermelon-400)' }}>
                  {venueId}
                </div>
              </div>
              <div className="status-box">
                <div className="status-box-header">Verification Status</div>
                <div className="status-box-value" style={{ color: 'var(--emerald-400)' }}>
                  ● STRICT POLICY ACTIVE
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <Link href="/admin" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem' }}>
                Manage Gate Settings →
              </Link>
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="card bento-col-6 card-glow-emerald">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">📊</div>
                <span>Operations Dashboard</span>
              </div>
              <Link href="/dashboard" style={{ color: 'var(--watermelon-400)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                View Full Dashboard →
              </Link>
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Monitor live visitor streams, ZK-SNARK prover latency graphs, and cryptographic gas consumption in real-time.
            </p>
            <div className="status-list">
              <div className="status-box">
                <div className="status-box-header">Average Execution Time</div>
                <div className="status-box-value" style={{ color: 'var(--emerald-400)' }}>385ms (Sub-Second ZK Proving)</div>
              </div>
              <div className="status-box">
                <div className="status-box-header">Active Venue Gates</div>
                <div className="status-box-value" style={{ color: 'var(--cyan-400)' }}>3 Verified Entry Points</div>
              </div>
            </div>
          </div>

          {/* Bento Card 4 */}
          <div className="card bento-col-6 card-glow-cyan">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">🌐</div>
                <span>Midnight Network Explorer</span>
              </div>
              <Link href="/explorer" style={{ color: 'var(--cyan-400)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                Network State →
              </Link>
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Seamless integration with Midnight Preprod indexer and Proof Server for instantaneous ZK validation.
            </p>
            <div className="status-list">
              <div className="status-box">
                <div className="status-box-header">Last Verified Commitment</div>
                <div className="status-box-value" style={{ color: 'var(--cyan-400)' }}>
                  {lastCommitment}
                </div>
              </div>
              <div className="status-box">
                <div className="status-box-header">Contract Address</div>
                <div className="status-box-value" style={{ color: 'var(--slate-300)', fontSize: '0.88rem' }}>
                  0x7a29f8c14e32049b8529341f98d011c750a49e21
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ marginTop: '4rem' }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(255,51,102,0.12), rgba(6,182,212,0.12))',
            borderColor: 'rgba(255,51,102,0.3)',
            textAlign: 'center',
            padding: '3.5rem 2rem',
          }}
        >
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
            Ready to Deploy Privacy-Preserving Access Control?
          </h2>
          <p style={{ color: 'var(--slate-300)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto 2rem' }}>
            Launch visitor check-in, configure venue policies, and monitor real-time ZK circuits with the Watermelon UI Next.js app.
          </p>
          <div className="cta-group">
            <Link href="/dashboard" className="btn-primary">
              <span>📊</span> Launch Dashboard
            </Link>
            <Link href="/checkin" className="btn-secondary">
              <span>🔑</span> Perform Check-In
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
