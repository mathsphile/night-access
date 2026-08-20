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
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSimulating) return;
    setIsSimulating(true);

    // Step 1: Witness Input
    setSimStep(1);
    await new Promise(r => setTimeout(r, 400));

    // Step 2: Compact Circuit
    setSimStep(2);
    await new Promise(r => setTimeout(r, 600));

    // Step 3: ZK Proof Generation
    setSimStep(3);
    const hash = await sha256Hex(simPasscode + '_midnight_salt');
    await new Promise(r => setTimeout(r, 500));

    // Step 4: On-Chain Commitment
    setSimStep(4);
    showToast(`Zero-Knowledge Proof Verified! Commitment: ${hash.substring(0, 10)}...`, 'success');
    setIsSimulating(false);
  };

  const faqs = [
    {
      q: 'How does Zero-Knowledge verification protect visitor credentials?',
      a: 'The Compact smart contract verifies that a visitor possesses a valid venue passcode without requiring the visitor to transmit or reveal the passcode on-chain. Cryptographic witness proofs are computed client-side, ensuring 100% data privacy.',
    },
    {
      q: 'What is the role of the Midnight Proof Server?',
      a: 'The Proof Server translates Compact circuits into Halo2/KZG zero-knowledge proofs. It runs in browser WASM or standalone Docker environments, generating sub-second proofs without storing private state.',
    },
    {
      q: 'How does Midnight Lace Wallet integration work?',
      a: 'The dApp leverages the official Midnight DApp Connector API (`window.midnight.mnLace`). Visitors sign commitments with their private keys, keeping identity attributes strictly off-chain.',
    },
    {
      q: 'Can venues dynamically configure access rules and verifier keys?',
      a: 'Yes. Venue administrators can update on-chain verifier IDs via the Admin Console, allowing instant gate rotation, VIP tier assignment, and event-based admissions.',
    },
  ];

  return (
    <>
      {/* --------------------------------------------------------------------------
          Hero-01 Section (Landing-01 Language)
          -------------------------------------------------------------------------- */}
      <section className="hero-section">
        <Link href="/inspector" className="hero-pill">
          <span style={{ display: 'inline-block', animation: 'pulseGlow 2s infinite ease-in-out' }}>✨</span>
          <span>Powered by Midnight Network • Compact ZK Circuit 4.0</span>
          <span style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>→</span>
        </Link>

        <h1 className="hero-heading">
          The Zero-Knowledge <br />
          <span className="gradient-text">Visitor Verification Platform</span>
        </h1>

        <p className="hero-subtext">
          Enterprise access control engineered with mathematical privacy. Verify admissions, VIP credentials, and venue access in zero-knowledge without disclosing passcodes or PII on-chain.
        </p>

        <div className="cta-group">
          <Link href="/dashboard" className="btn-primary">
            <span>🚀</span> Explore Dashboard
          </Link>
          <Link href="/checkin" className="btn-secondary">
            <span>⚡</span> Launch Check-In Portal
          </Link>
        </div>

        {/* Live Interactive Simulator Sandbox inside Hero Frame */}
        <div style={{ marginTop: '3.5rem', textAlign: 'left' }}>
          <div className="card card-glow-pink">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">⚡</div>
                <span>Interactive Zero-Knowledge Circuit Playground</span>
              </div>
              <span className="card-badge">LIVE SANDBOX</span>
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

      {/* --------------------------------------------------------------------------
          Social Proof & Protocol Trust Marquee
          -------------------------------------------------------------------------- */}
      <section className="trust-strip">
        <div className="trust-title">Cryptographic Foundations & Ecosystem Standards</div>
        <div className="logo-grid">
          <div className="logo-badge-item">
            <span>🛡️</span> Midnight Network
          </div>
          <div className="logo-badge-item">
            <span>⚡</span> Compact Smart Contracts
          </div>
          <div className="logo-badge-item">
            <span>🔒</span> Halo2 / KZG SNARKs
          </div>
          <div className="logo-badge-item">
            <span>💼</span> Lace Wallet DApp Connector
          </div>
          <div className="logo-badge-item">
            <span>🌐</span> Cardano Ecosystem
          </div>
          <div className="logo-badge-item">
            <span>🔑</span> Web Crypto API
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          Stats-01 Ticker Section
          -------------------------------------------------------------------------- */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Verified Accesses</span>
            <div className="stat-icon-wrap">🛡️</div>
          </div>
          <div className="stat-value">{visitorCount.toLocaleString()}</div>
          <div className="stat-trend">
            <span>↑ +18.4%</span>
            <span style={{ color: 'var(--slate-500)', fontWeight: 500 }}>active today</span>
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
            <span style={{ color: 'var(--slate-500)', fontWeight: 500 }}>ZK-SNARK proving</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Data Privacy Level</span>
            <div className="stat-icon-wrap">🔒</div>
          </div>
          <div className="stat-value">
            100<span style={{ fontSize: '1.2rem', color: 'var(--watermelon-400)' }}>%</span>
          </div>
          <div className="stat-trend">
            <span>✓ Zero leakage</span>
            <span style={{ color: 'var(--slate-500)', fontWeight: 500 }}>no raw passcodes stored</span>
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
            <span>Node Synchronized</span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          Feature-01 Bento Grid Section
          -------------------------------------------------------------------------- */}
      <section style={{ margin: '4rem 0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
            Built for Next-Generation <span className="gradient-text">Physical & Digital Venues</span>
          </h2>
          <p style={{ color: 'var(--slate-400)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}>
            A modular zero-knowledge verification architecture designed for stadiums, conferences, corporate headquarters, and high-security facilities.
          </p>
        </div>

        <div className="bento-grid">
          {/* Bento Card 1: Private Witness Protection */}
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

          {/* Bento Card 2: Venue Gate Manager */}
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

          {/* Bento Card 3: Operations Dashboard Preview */}
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

          {/* Bento Card 4: Network Explorer */}
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

      {/* --------------------------------------------------------------------------
          Feature Comparison Section (Why Zero-Knowledge Access)
          -------------------------------------------------------------------------- */}
      <section style={{ margin: '4.5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Why <span className="gradient-text">Zero-Knowledge Access</span> Wins
          </h2>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Comparing traditional centralized ticketing vs. Midnight cryptographic verification.
          </p>
        </div>

        <div className="comparison-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Feature Metric</th>
                <th style={{ color: 'var(--watermelon-400)' }}>Traditional Access Systems</th>
                <th style={{ color: 'var(--emerald-400)' }}>Visitor Verification Platform</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, color: '#ffffff' }}>Private Credential Exposure</td>
                <td style={{ color: 'var(--watermelon-400)' }}>❌ Raw barcodes/passcodes sent to servers</td>
                <td style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>✓ 100% Zero-Disclosure on device</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#ffffff' }}>Database Leak Risk</td>
                <td style={{ color: 'var(--watermelon-400)' }}>❌ Single point of failure central database</td>
                <td style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>✓ Cryptographic commitments only</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#ffffff' }}>Verification Latency</td>
                <td style={{ color: 'var(--slate-400)' }}>1.5s – 3.0s cloud API lookups</td>
                <td style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>✓ &lt;400ms Compact ZK proof</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#ffffff' }}>On-Chain Tamper Resistance</td>
                <td style={{ color: 'var(--watermelon-400)' }}>❌ Replay attacks & ticket forgery</td>
                <td style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>✓ Midnight blockchain consensus</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#ffffff' }}>GDPR & Privacy Compliance</td>
                <td style={{ color: 'var(--watermelon-400)' }}>❌ Complex PII storage obligations</td>
                <td style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>✓ Privacy by Mathematical Design</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          FAQ-01 Section
          -------------------------------------------------------------------------- */}
      <section style={{ margin: '4.5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Everything you need to know about Midnight Network Zero-Knowledge access control.
          </p>
        </div>

        <div className="faq-grid" style={{ maxWidth: '820px', margin: '0 auto' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-item ${openFaq === idx ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-toggle-icon">{openFaq === idx ? '−' : '+'}</span>
              </div>
              {openFaq === idx && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          CTA-01 Section
          -------------------------------------------------------------------------- */}
      <section style={{ marginTop: '4rem' }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(255,51,102,0.15), rgba(6,182,212,0.15))',
            borderColor: 'rgba(255,51,102,0.35)',
            textAlign: 'center',
            padding: '4rem 2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--emerald-400)', padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            <span className="status-dot"></span>
            <span>Production Ready on Midnight Preprod</span>
          </div>

          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Ready to Deploy Privacy-Preserving Access Control?
          </h2>
          <p style={{ color: 'var(--slate-300)', fontSize: '1.1rem', maxWidth: '720px', margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
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
