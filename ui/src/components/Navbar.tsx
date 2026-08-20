'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Shield, Search, Wallet, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { isWalletConnected, walletAddress, toggleWallet, setIsCmdOpen } = useApp();

  const navLinks = [
    { label: 'Overview', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Check-In', href: '/checkin' },
    { label: 'Venue Admin', href: '/admin' },
    { label: 'ZK Inspector', href: '/inspector' },
    { label: 'Explorer', href: '/explorer' },
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link href="/" className="brand">
          <div className="brand-logo-mark">
            <Shield size={16} strokeWidth={2.2} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span className="brand-name">Night Access</span>
            <span className="brand-tag">PREPROD</span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          <button
            type="button"
            className="cmd-trigger-btn"
            onClick={() => setIsCmdOpen(true)}
            title="Open Command Palette (⌘K)"
          >
            <Search size={14} />
            <span>Search</span>
            <kbd className="cmd-kbd">⌘K</kbd>
          </button>

          <div className="network-badge">
            <span className="status-dot"></span>
            <span>Preprod</span>
          </div>

          <button
            type="button"
            className={`connect-btn ${isWalletConnected ? 'connected' : ''}`}
            onClick={() => toggleWallet()}
          >
            {isWalletConnected ? (
              <>
                <CheckCircle2 size={14} color="#16a34a" />
                <span>
                  {walletAddress
                    ? `${walletAddress.substring(0, 5)}...${walletAddress.substring(walletAddress.length - 4)}`
                    : 'Connected'}
                </span>
              </>
            ) : (
              <>
                <Wallet size={14} />
                <span>Connect Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
