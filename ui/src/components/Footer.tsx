'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="brand-logo-mark" style={{ width: 22, height: 22 }}>
            <Shield size={12} />
          </div>
          <span>Visitor Verification Platform • Midnight Network</span>
        </div>

        <div className="footer-links">
          <Link href="/inspector" className="footer-link">
            Compact Contract
          </Link>
          <Link href="/explorer" className="footer-link">
            Network Explorer
          </Link>
          <a
            href="https://docs.midnight.network"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Midnight Docs ↗
          </a>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Midnight Foundation
          </span>
        </div>
      </div>
    </footer>
  );
}
