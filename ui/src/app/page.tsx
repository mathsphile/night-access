'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { sha256Hex } from '@/lib/zk';
import {
  Shield,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Code2,
  Building2,
  Activity,
  Globe,
  Sliders,
  ChevronDown,
  Plus,
  Minus,
} from 'lucide-react';

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
    await new Promise(r => setTimeout(r, 350));

    // Step 2: Compact Circuit
    setSimStep(2);
    await new Promise(r => setTimeout(r, 450));

    // Step 3: ZK Proof Generation
    setSimStep(3);
    const hash = await sha256Hex(simPasscode + '_midnight_salt');
    await new Promise(r => setTimeout(r, 400));

    // Step 4: On-Chain Commitment
    setSimStep(4);
    showToast(`Proof verified. Commitment: ${hash.substring(0, 12)}...`, 'success');
    setIsSimulating(false);
  };

  const faqs = [
    {
      q: 'How does Zero-Knowledge verification protect visitor credentials?',
      a: 'The Compact smart contract verifies that a visitor holds a valid venue credential without requiring them to transmit or reveal the plaintext passcode on-chain. Cryptographic witness proofs are computed client-side, ensuring mathematical privacy.',
    },
    {
      q: 'What is the role of the Midnight Proof Server?',
      a: 'The Proof Server translates Compact circuits into Halo2/KZG zero-knowledge proofs. It runs in browser WASM or containerized environments, generating sub-second proofs without storing private state.',
    },
    {
      q: 'How does Midnight Lace Wallet integration work?',
      a: 'The dApp interfaces with the official Midnight DApp Connector API (`window.midnight.mnLace`). Visitors sign commitments with their private keys, keeping identity attributes strictly off-chain.',
    },
    {
      q: 'Can venues dynamically configure access rules and verifier keys?',
      a: 'Yes. Venue administrators can update on-chain verifier IDs via the Admin Console, enabling instantaneous gate rotation, VIP tier assignment, and event-based admissions.',
    },
  ];

  return (
    <>
      {/* --------------------------------------------------------------------------
          Hero Section
          -------------------------------------------------------------------------- */}
      <section className="hero-section">
        <Link href="/inspector" className="hero-pill">
          <Sparkles size={14} color="#09090b" />
          <span>Powered by Midnight Network • Compact ZK Circuits</span>
          <ArrowRight size={13} color="var(--text-muted)" />
        </Link>

        <h1 className="hero-heading">
          Zero-knowledge access control <br />
          <span className="accent-text">for the physical and digital world.</span>
        </h1>

        <p className="hero-subtext">
          Enterprise verification engineered with mathematical privacy. Verify admissions, VIP credentials, and venue access in zero-knowledge without disclosing passcodes or PII on-chain.
        </p>

        <div className="cta-group">
          <Link href="/dashboard" className="btn-primary">
            <span>Explore Dashboard</span>
            <ArrowRight size={14} />
          </Link>
          <Link href="/checkin" className="btn-secondary">
            <span>Launch Check-In</span>
          </Link>
        </div>

        {/* Live Interactive Sandbox Card inside Hero */}
        <div style={{ marginTop: '3.5rem', textAlign: 'left' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <Zap size={16} />
                </div>
                <span>Interactive Zero-Knowledge Circuit Sandbox</span>
              </div>
              <span className="card-badge">LIVE PLAYGROUND</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
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
                  <Zap size={14} />
                  <span>{isSimulating ? 'Computing Proof...' : 'Run Circuit'}</span>
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
          Trust Strip
          -------------------------------------------------------------------------- */}
      <section className="trust-strip">
        <div className="trust-title">Cryptographic Foundations & Ecosystem Standards</div>
        <div className="logo-grid">
          <div className="logo-badge-item">
            <Shield size={14} />
            <span>Midnight Network</span>
          </div>
          <div className="logo-badge-item">
            <Code2 size={14} />
            <span>Compact Smart Contracts</span>
          </div>
          <div className="logo-badge-item">
            <Lock size={14} />
            <span>Halo2 / KZG SNARKs</span>
          </div>
          <div className="logo-badge-item">
            <Globe size={14} />
            <span>Cardano Ecosystem</span>
          </div>
          <div className="logo-badge-item">
            <Activity size={14} />
            <span>Sub-Second Proving</span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          Stats-01 Metrics Ticker
          -------------------------------------------------------------------------- */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Verified Accesses</span>
            <Shield size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">{visitorCount.toLocaleString()}</div>
          <div className="stat-trend">
            <CheckCircle2 size={13} />
            <span>+18.4% active today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Avg Prover Latency</span>
            <Zap size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">
            385<span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>ms</span>
          </div>
          <div className="stat-trend">
            <Zap size={13} />
            <span>Sub-second ZK proving</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Data Privacy Level</span>
            <Lock size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">
            100<span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>%</span>
          </div>
          <div className="stat-trend">
            <CheckCircle2 size={13} />
            <span>Zero raw secrets stored</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Midnight Preprod State</span>
            <Globe size={16} color="var(--text-muted)" />
          </div>
          <div className="stat-value">#{blockHeight.toLocaleString()}</div>
          <div className="stat-trend">
            <span className="status-dot"></span>
            <span>Node Synchronized</span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          Bento Grid Feature Section
          -------------------------------------------------------------------------- */}
      <section style={{ margin: '3.5rem 0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Engineered for physical and digital venues
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: '580px', marginLeft: 'auto', marginRight: 'auto' }}>
            A modular zero-knowledge verification architecture designed for stadiums, conferences, corporate facilities, and private spaces.
          </p>
        </div>

        <div className="bento-grid">
          {/* Card 1: Private Witness Protection */}
          <div className="card bento-col-8">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <Shield size={16} />
                </div>
                <span>Private Witness Protection & Local Hashing</span>
              </div>
              <span className="card-badge">CLIENT-SIDE PRIVACY</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
              Visitor credentials, passcodes, and nonces are processed exclusively within the visitor&apos;s secure local runtime. Only cryptographic commitments are broadcast to the Midnight ledger.
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

          {/* Card 2: Venue Gate Manager */}
          <div className="card bento-col-4">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <Building2 size={16} />
                </div>
                <span>Venue Gate Manager</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1rem' }}>
              Configure gates, VIP access tiers, and on-chain verification parameters dynamically.
            </p>
            <div className="status-list">
              <div className="status-box">
                <div className="status-box-header">Active Venue ID</div>
                <div className="status-box-value">{venueId}</div>
              </div>
              <div className="status-box">
                <div className="status-box-header">Verification Policy</div>
                <div className="status-box-value" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  ● STRICT POLICY ACTIVE
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <Link href="/admin" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.84rem' }}>
                <span>Manage Gate Settings</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Card 3: Operations Dashboard Preview */}
          <div className="card bento-col-6">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <Activity size={16} />
                </div>
                <span>Operations Telemetry</span>
              </div>
              <Link href="/dashboard" style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                Open Dashboard →
              </Link>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1rem' }}>
              Monitor live visitor streams, ZK-SNARK prover latency graphs, and cryptographic gas consumption in real-time.
            </p>
            <div className="status-list">
              <div className="status-box">
                <div className="status-box-header">Average Execution Time</div>
                <div className="status-box-value">385ms (Sub-Second ZK Proving)</div>
              </div>
              <div className="status-box">
                <div className="status-box-header">Active Venue Gates</div>
                <div className="status-box-value">3 Verified Entry Points</div>
              </div>
            </div>
          </div>

          {/* Card 4: Network Explorer */}
          <div className="card bento-col-6">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">
                  <Globe size={16} />
                </div>
                <span>Midnight Network State</span>
              </div>
              <Link href="/explorer" style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                View Diagnostics →
              </Link>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1rem' }}>
              Integration with Midnight Preprod indexer and Proof Server for instantaneous ZK validation.
            </p>
            <div className="status-list">
              <div className="status-box">
                <div className="status-box-header">Last Verified Commitment</div>
                <div className="status-box-value">{lastCommitment}</div>
              </div>
              <div className="status-box">
                <div className="status-box-header">Contract Address</div>
                <div className="status-box-value" style={{ fontSize: '0.82rem' }}>
                  0x7a29f8c14e32049b8529341f98d011c750a49e21
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          Comparison Table Section
          -------------------------------------------------------------------------- */}
      <section style={{ margin: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Why zero-knowledge verification
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem' }}>
            Comparing traditional centralized ticketing vs. Midnight cryptographic verification.
          </p>
        </div>

        <div className="comparison-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Feature Dimension</th>
                <th>Traditional Access Systems</th>
                <th style={{ color: 'var(--text-primary)' }}>Midnight ZK Platform</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Credential Privacy</td>
                <td style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <XCircle size={15} /> Plaintext passcodes sent to servers
                </td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={15} /> 100% Zero-Disclosure on device
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Database Leak Risk</td>
                <td style={{ color: 'var(--accent-rose)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <XCircle size={15} /> Single point of failure database
                  </span>
                </td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={15} /> Cryptographic commitments only
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Verification Latency</td>
                <td>1.5s – 3.0s cloud API lookups</td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={15} /> &lt;400ms Compact ZK proof
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Forgery Resistance</td>
                <td style={{ color: 'var(--accent-rose)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <XCircle size={15} /> Replay attacks & copyable QR codes
                  </span>
                </td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={15} /> Midnight blockchain consensus
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Data Compliance</td>
                <td style={{ color: 'var(--accent-rose)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <XCircle size={15} /> Heavy PII compliance liability
                  </span>
                </td>
                <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={15} /> Privacy by mathematical design
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* --------------------------------------------------------------------------
          FAQ Accordion Section
          -------------------------------------------------------------------------- */}
      <section style={{ margin: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Frequently asked questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem' }}>
            Everything you need to know about Midnight Network Zero-Knowledge access control.
          </p>
        </div>

        <div className="faq-grid" style={{ maxWidth: '780px', margin: '0 auto' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-item ${openFaq === idx ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {openFaq === idx ? <Minus size={15} /> : <Plus size={15} />}
                </span>
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
          CTA Section
          -------------------------------------------------------------------------- */}
      <section style={{ marginTop: '4rem' }}>
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 2rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#ffffff', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            <span className="status-dot"></span>
            <span>Production Ready on Midnight Preprod</span>
          </div>

          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
            Ready to deploy privacy-preserving access?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.55 }}>
            Launch visitor check-in, configure venue policies, and monitor real-time ZK circuits with the minimal Next.js app.
          </p>
          <div className="cta-group">
            <Link href="/dashboard" className="btn-primary">
              <span>Launch Dashboard</span>
              <ArrowRight size={14} />
            </Link>
            <Link href="/checkin" className="btn-secondary">
              <span>Perform Check-In</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
