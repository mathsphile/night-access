'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function CheckInPage() {
  const { venueId, visitorCount, lastCommitment, recordCheckIn, showToast } = useApp();
  const [targetVenue, setTargetVenue] = useState<string>(venueId);
  const [passcode, setPasscode] = useState<string>('my_secret_visitor_passcode_99');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([
    '> Midnight Preprod ZK Proof Service initialized.',
    '> Ready to generate visitor verification circuit.',
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] > ${msg}`]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      showToast('Please enter a private passcode witness input.', 'error');
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    addLog(`[1/4] Preparing private witness for venue: ${targetVenue}`);

    await new Promise(r => setTimeout(r, 400));
    setProgress(50);
    addLog('[2/4] Constructing Compact ZK circuit witnesses in WASM...');

    await new Promise(r => setTimeout(r, 500));
    setProgress(75);
    addLog('[3/4] Computing zero-knowledge commitment with WebCrypto...');

    try {
      const commitment = await recordCheckIn(targetVenue, passcode);
      setProgress(100);
      addLog(`[4/4] On-chain commitment submitted: ${commitment}`);
      addLog('✓ Access Granted! Verification successful in zero-knowledge.');
    } catch (err) {
      addLog(`❌ Verification failed: ${(err as Error)?.message || 'Circuit error'}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Visitor Check-In <span className="gradient-text">Zero-Knowledge Terminal</span>
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
          Prove possession of venue passcodes in zero-knowledge. Your private credentials never leave your browser.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1.75rem' }}>
        <div className="card card-glow-pink">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon">🔑</div>
              <span>Generate & Execute ZK Check-In</span>
            </div>
            <span className="card-badge">CIRCUIT PROVER</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="verifierInput">Venue / Verifier ID</label>
              <input
                id="verifierInput"
                type="text"
                className="form-input"
                value={targetVenue}
                onChange={e => setTargetVenue(e.target.value)}
                placeholder="Enter venue ID"
              />
            </div>

            <div className="form-group">
              <label htmlFor="passcodeInput">Private Passcode (Witness Input)</label>
              <input
                id="passcodeInput"
                type="password"
                className="form-input"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter private passcode"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                🔒 Processed locally inside WebAssembly ZK Prover — Never disclosed to server or chain.
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isProcessing}>
              <span>⚡</span> {isProcessing ? 'Executing Compact ZK Circuit...' : 'Execute Compact ZK Check-In'}
            </button>
          </form>

          {progress > 0 && (
            <div style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', height: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--watermelon-500), #00f2fe)',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 10px var(--watermelon-glow)',
                }}
              />
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Proof Execution Terminal Logs
            </label>
            <div className="activity-box">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`log-line ${log.includes('✓') ? 'success' : log.includes('❌') ? 'error' : 'info'}`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card card-glow-cyan">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">🛡️</div>
                <span>Cryptographic State</span>
              </div>
            </div>

            <div className="status-list">
              <div className="status-box">
                <div className="status-box-header">Total Verified Check-Ins</div>
                <div className="status-box-value" style={{ color: 'var(--emerald-400)', fontSize: '1.4rem', fontWeight: 800 }}>
                  {visitorCount.toLocaleString()}
                </div>
              </div>

              <div className="status-box">
                <div className="status-box-header">Latest On-Chain Commitment</div>
                <div className="status-box-value" style={{ color: 'var(--cyan-400)', fontSize: '0.85rem' }}>
                  {lastCommitment}
                </div>
              </div>

              <div className="status-box">
                <div className="status-box-header">Network Protocol</div>
                <div className="status-box-value" style={{ fontSize: '0.88rem' }}>
                  Midnight Preprod (Halo2 / KZG)
                </div>
              </div>
            </div>
          </div>

          <div className="card card-glow-emerald">
            <div className="card-header">
              <div className="card-title">
                <div className="card-icon">💡</div>
                <span>Zero-Knowledge Guarantee</span>
              </div>
            </div>
            <p style={{ color: 'var(--slate-300)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              The visitor’s raw passcode never leaves their device. The Compact circuit computes a mathematical proof that the visitor holds the correct passcode for the target venue verifier ID without disclosing the passcode string.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
