'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span style={{ fontSize: '1.2rem' }}>🍉</span>
          <span>Visitor Verification Platform • Watermelon UI Next.js</span>
        </div>
        <div className="footer-links">
          <Link href="/" className="footer-link">Home</Link>
          <Link href="/dashboard" className="footer-link">Dashboard</Link>
          <Link href="/checkin" className="footer-link">Check-In</Link>
          <Link href="/admin" className="footer-link">Venue Admin</Link>
          <Link href="/inspector" className="footer-link">ZK Inspector</Link>
          <Link href="/explorer" className="footer-link">Explorer</Link>
        </div>
      </div>
    </footer>
  );
};
