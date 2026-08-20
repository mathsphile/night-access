'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isWalletConnected, walletAddress, toggleWallet, setIsCmdOpen } = useApp();

  const navLinks = [
    { href: '/', label: 'Home', icon: '✨' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/checkin', label: 'Check-In', icon: '🔑' },
    { href: '/admin', label: 'Venue Admin', icon: '🏛️' },
    { href: '/inspector', label: 'Inspector', icon: '🔍' },
    { href: '/explorer', label: 'Explorer', icon: '🌐' },
  ];

  const shortAddr = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : '';

  return (
    <header>
      <nav className="navbar" aria-label="Main Navigation">
        <div className="navbar-container">
          <Link href="/" className="brand">
            <div className="brand-logo">🍉</div>
            <div className="brand-text">
              <div className="brand-title">Watermelon VVP</div>
              <div className="brand-subtitle">Midnight ZK Access</div>
            </div>
          </Link>

          <div className="nav-links">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <span>{link.icon}</span> {link.label}
                </Link>
              );
            })}
          </div>

          <div className="navbar-actions">
            <button
              className="cmd-trigger-btn"
              onClick={() => setIsCmdOpen(true)}
              title="Search or run actions (⌘K)"
            >
              <span>🔍</span>
              <span>Search</span>
              <span className="cmd-kbd">⌘K</span>
            </button>

            <div className="network-badge">
              <div className="status-dot"></div>
              <span>Preprod</span>
            </div>

            <button
              className={`connect-btn ${isWalletConnected ? 'connected' : ''}`}
              onClick={toggleWallet}
            >
              {isWalletConnected ? `Connected: ${shortAddr}` : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
