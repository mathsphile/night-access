'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sliders,
  Shield,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function AdminPage() {
  const { venueId, updateVenueId, showToast } = useApp();
  const [newVenueInput, setNewVenueInput] = useState(venueId);
  const [activeTier, setActiveTier] = useState<'Standard' | 'VIP' | 'Staff'>('VIP');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueInput.trim()) {
      showToast('Venue verifier ID cannot be empty', 'error');
      return;
    }

    setIsUpdating(true);
    await new Promise(r => setTimeout(r, 450));
    updateVenueId(newVenueInput.trim());
    setIsUpdating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Venue Gate Administration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Configure on-chain access control rules, verifier identifiers, and gate admission policies.
        </p>
      </div>

      <div className="bento-grid" style={{ margin: 0 }}>
        {/* Left Column: Verifier Settings Form */}
        <div className="card bento-col-7">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon">
                <Sliders size={16} />
              </div>
              <span>Gate Configuration</span>
            </div>
            <span className="card-badge">ADMIN CONTROL</span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
            Update the target on-chain verifier ID used by Compact circuits to authenticate visitors.
          </p>

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Target Verifier ID</label>
              <input
                type="text"
                className="form-input"
                value={newVenueInput}
                onChange={e => setNewVenueInput(e.target.value)}
                placeholder="e.g. main_hall_entry"
                required
              />
            </div>

            <div className="form-group">
              <label>Admission Access Tier</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['Standard', 'VIP', 'Staff'] as const).map(tier => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setActiveTier(tier)}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      background: activeTier === tier ? 'var(--text-primary)' : 'var(--bg-subtle)',
                      color: activeTier === tier ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={isUpdating}
              style={{ marginTop: '1.5rem' }}
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={14} />
                  <span>Updating On-Chain State...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Update Active Verifier ID</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live On-Chain Parameters */}
        <div className="card bento-col-5">
          <div className="card-header">
            <div className="card-title">
              <div className="card-icon">
                <Shield size={16} />
              </div>
              <span>Active Gate Parameters</span>
            </div>
            <span className="card-badge">SYNCHRONIZED</span>
          </div>

          <div className="status-list">
            <div className="status-box">
              <div className="status-box-header">Current Active Verifier</div>
              <div className="status-box-value">{venueId}</div>
            </div>

            <div className="status-box">
              <div className="status-box-header">Selected Admission Tier</div>
              <div className="status-box-value" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {activeTier} Access
              </div>
            </div>

            <div className="status-box">
              <div className="status-box-header">Smart Contract Verification Policy</div>
              <div className="status-box-value" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                ● STRICT ZERO-KNOWLEDGE PROOF
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
