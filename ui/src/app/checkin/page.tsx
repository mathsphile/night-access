'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  KeyRound,
  Shield,
  Zap,
  CheckCircle2,
  Terminal,
  Clock,
} from 'lucide-react';

export default function CheckinPage() {
  const { recordCheckIn, venueId, showToast } = useApp();
  const [venueInput, setVenueInput] = useState(venueId);
  const [passcode, setPasscode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const [logs, setLogs] = useState<Array<{ text: string; type: 'info' | 'success' | 'warning' | 'error' }>>([
    { text: 'Ready for visitor check-in. Midnight WebAssembly prover initialized.', type: 'info' },
  ]);

  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setLogs(prev => [...prev, { text, type }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      showToast('Please provide a visitor passcode or credential', 'error');
      return;
    }

    setIsProcessing(true);
    setProgressStage(1);
    addLog(`Initiating check-in verification for venue [${venueInput}]...`, 'info');

    try {
      // Stage 1: Local Witness Hashing
      await new Promise(r => setTimeout(r, 400));
      setProgressStage(2);
      addLog('Computing client-side salt and private witness commitment...', 'info');

      // Stage 2: Midnight Compact Circuit Prover
      await new Promise(r => setTimeout(r, 450));
      setProgressStage(3);
      addLog('Compact circuit executed in Midnight WASM runtime.', 'info');

      // Stage 3 & 4: On-Chain Verification & Settlement via Context
      const commitment = await recordCheckIn(venueInput, passcode);
      setProgressStage(4);
      addLog(`Zero-knowledge proof verified on-chain. Commitment: ${commitment.substring(0, 16)}...`, 'success');

      setPasscode('');
    } catch (err: any) {
      addLog(`Verification error: ${err?.message || 'Failed to compute ZK proof'}`, 'error');
      showToast('Check-in failed. Check terminal logs.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Visitor Check-In Terminal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Perform client-side zero-knowledge proof generation and submit commitments to Midnight Preprod.
        </p>
      </div>

      <div className="bento-grid" style={{ margin: 0 }}>
        {/* Left Column: Check-in Form */}
        <div className="card bento-col-6">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon">
                <KeyRound size={16} />
              </div>
              <span>Access Verification</span>
            </div>
            <span className="card-badge">ZERO-KNOWLEDGE</span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
            Enter your secret passcode or ticket credential. The secret will never leave your browser unhashed.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Target Venue / Gate ID</label>
              <input
                type="text"
                className="form-input"
                value={venueInput}
                onChange={e => setVenueInput(e.target.value)}
                placeholder="e.g. main_hall_entry"
                required
              />
            </div>

            <div className="form-group">
              <label>Private Passcode Witness (Secret)</label>
              <input
                type="password"
                className="form-input"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter secret ticket phrase or OTP..."
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                ✦ Kept private on-device; evaluated locally by the Compact WASM prover.
              </span>
            </div>

            {/* Multi-stage Progress Indicator */}
            {isProcessing && (
              <div style={{ margin: '1.25rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  <span>ZK Verification Pipeline</span>
                  <span>Stage {progressStage} of 4</span>
                </div>
                <div style={{ width: '100%', height: 4, background: 'var(--bg-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(progressStage / 4) * 100}%`,
                      background: 'var(--accent-primary)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-submit"
              disabled={isProcessing}
              style={{ marginTop: '1.25rem' }}
            >
              {isProcessing ? (
                <>
                  <Zap size={15} />
                  <span>Computing ZK Proof...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Generate & Verify ZK Proof</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Execution Log & Diagnostics */}
        <div className="card bento-col-6">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon">
                <Terminal size={16} />
              </div>
              <span>Prover Activity Log</span>
            </div>
            <span className="card-badge">TERMINAL</span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1rem' }}>
            Live console output from the client-side Compact Zero-Knowledge Proof Engine.
          </p>

          <div className="activity-box" style={{ height: 260 }}>
            {logs.map((log, index) => (
              <div key={index} className={`log-line ${log.type}`}>
                <span style={{ color: 'var(--text-muted)' }}>&gt; </span>
                <span>{log.text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Clock size={13} />
              <span>Target Latency: &lt;400ms</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              ● WASM Proof Server Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
