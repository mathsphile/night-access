'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Search,
  LayoutDashboard,
  KeyRound,
  Sliders,
  Code2,
  Globe,
  Home,
  Wallet,
  CornerDownLeft,
} from 'lucide-react';

export default function CommandPalette() {
  const router = useRouter();
  const { isCmdOpen, setIsCmdOpen, toggleWallet } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    {
      title: 'Overview',
      subtitle: 'Landing page & ZK sandbox',
      icon: Home,
      action: () => router.push('/'),
    },
    {
      title: 'Dashboard',
      subtitle: 'Real-time telemetry and access stream',
      icon: LayoutDashboard,
      action: () => router.push('/dashboard'),
    },
    {
      title: 'Check-In Terminal',
      subtitle: 'Verify visitor ticket with zero-knowledge proof',
      icon: KeyRound,
      action: () => router.push('/checkin'),
    },
    {
      title: 'Venue Gate Admin',
      subtitle: 'Configure target verifiers and security policies',
      icon: Sliders,
      action: () => router.push('/admin'),
    },
    {
      title: 'ZK Circuit Inspector',
      subtitle: 'View Compact bboard.compact smart contract',
      icon: Code2,
      action: () => router.push('/inspector'),
    },
    {
      title: 'Network Explorer',
      subtitle: 'Midnight Preprod network status and diagnostics',
      icon: Globe,
      action: () => router.push('/explorer'),
    },
    {
      title: 'Connect Lace Wallet',
      subtitle: 'Authenticate with Midnight browser wallet',
      icon: Wallet,
      action: () => toggleWallet(),
    },
  ];

  const filtered = actions.filter(
    item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCmdOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCmdOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
      setIsCmdOpen(false);
    }
  };

  if (!isCmdOpen) return null;

  return (
    <div className="cmd-modal-backdrop" onClick={() => setIsCmdOpen(false)}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <Search size={16} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-search-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="cmd-kbd">ESC</kbd>
        </div>

        <div className="cmd-results">
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.title}
                  type="button"
                  className={`cmd-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    item.action();
                    setIsCmdOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: isSelected ? '#ffffff' : 'var(--bg-subtle)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={14} color="var(--text-primary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {isSelected && <CornerDownLeft size={13} color="var(--text-muted)" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
