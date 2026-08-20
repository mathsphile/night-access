'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function AdminPage() {
  const { venueId, visitorCount, updateVenueId } = useApp();
  const [newVenue, setNewVenue] = useState('venue_vip_lounge_b');
  const [notice, setNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVenue.trim()) {
      updateVenueId(newVenue.trim());
      setNotice(true);
      setTimeout(() => setNotice(false), 4000);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Venue Gate <span className="gradient-text">Administration Console</span>
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
          Configure active venue verifiers, admission policies, and on-chain contract parameters.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
        <div className="card card-glow-pink">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon">🏛️</div>
              <span>Configure Venue Verifier</span>
            </div>
            <span className="card-badge">ADMIN CONTROL</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newVenueInput">New Target Venue / Verifier ID</label>
              <input
                id="newVenueInput"
                type="text"
                className="form-input"
                value={newVenue}
                onChange={e => setNewVenue(e.target.value)}
                placeholder="Enter verifier ID string"
              />
            </div>

            <div className="form-group">
              <label>Verification Policy Mode</label>
              <input
                type="text"
                className="form-input"
                value="Strict Passcode Hash Commitment"
                readOnly
                style={{ background: 'rgba(10,14,24,0.6)', color: 'var(--slate-400)' }}
              />
            </div>

            <button type="submit" className="btn-submit">
              <span>🔄</span> Update On-Chain Verifier
            </button>
          </form>

          {notice && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.85rem',
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--emerald-400)',
                fontSize: '0.88rem',
                fontWeight: 700,
              }}
            >
              ✓ Active Verifier ID successfully updated on-chain!
            </div>
          )}
        </div>

        <div className="card card-glow-cyan">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon">📊</div>
              <span>Attendance Analytics & Policy</span>
            </div>
          </div>

          <div className="status-list">
            <div className="status-box">
              <div className="status-box-header">Active Venue ID</div>
              <div className="status-box-value" style={{ color: 'var(--watermelon-400)', fontWeight: 700 }}>
                {venueId}
              </div>
            </div>

            <div className="status-box">
              <div className="status-box-header">Verifier Circuit Signature</div>
              <div className="status-box-value" style={{ fontSize: '0.85rem', color: 'var(--cyan-400)' }}>
                resetVerifier(newVerifier: Bytes&lt;32&gt;)
              </div>
            </div>

            <div className="status-box">
              <div className="status-box-header">Total Unique Visitors Recorded</div>
              <div className="status-box-value" style={{ color: 'var(--emerald-400)', fontSize: '1.4rem', fontWeight: 800 }}>
                {visitorCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
