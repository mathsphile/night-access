'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export const CommandPalette: React.FC = () => {
  const { isCmdOpen, setIsCmdOpen, toggleWallet } = useApp();
  const [search, setSearch] = useState('');
  const router = useRouter();

  if (!isCmdOpen) return null;

  const actions = [
    { label: '📊 Open Analytics Dashboard', href: '/dashboard', type: 'Page' },
    { label: '🔑 Visitor Check-In Terminal', href: '/checkin', type: 'Action' },
    { label: '🏛️ Venue Admin Console', href: '/admin', type: 'Admin' },
    { label: '🔍 ZK Circuit Inspector', href: '/inspector', type: 'Code' },
    { label: '🌐 Midnight Preprod Explorer', href: '/explorer', type: 'Network' },
    { label: '⚡ Toggle Midnight Lace Wallet', action: toggleWallet, type: 'Wallet' },
  ];

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: typeof actions[0]) => {
    setIsCmdOpen(false);
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <div
      className="cmd-modal-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) setIsCmdOpen(false);
      }}
    >
      <div className="cmd-palette">
        <div className="cmd-input-wrap">
          <span style={{ fontSize: '1.1rem', color: 'var(--slate-400)' }}>🔍</span>
          <input
            type="text"
            className="cmd-search-input"
            placeholder="Type a command or search pages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <span className="cmd-kbd" onClick={() => setIsCmdOpen(false)} style={{ cursor: 'pointer' }}>
            ESC
          </span>
        </div>

        <div className="cmd-results">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <button
                key={idx}
                className="cmd-item"
                onClick={() => handleSelect(item)}
              >
                <span>{item.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{item.type}</span>
              </button>
            ))
          ) : (
            <div style={{ padding: '1rem', color: 'var(--slate-500)', textAlign: 'center', fontSize: '0.88rem' }}>
              No matching commands or pages found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
