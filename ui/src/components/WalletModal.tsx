'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wallet, X, ExternalLink, Key, ChevronRight, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

// ─── Midnight DApp Connector types (Supports both v4 spec and legacy Lace) ──
interface MidnightWalletProvider {
  name?: string;
  icon?: string;
  apiVersion?: string;
  rdns?: string;
  // Official DApp Connector v4 API (1AM Wallet, modern Lace)
  connect?: (networkId: string) => Promise<{
    getUnshieldedAddress?: () => Promise<{ unshieldedAddress: string } | string>;
    getShieldedAddresses?: () => Promise<{ shieldedAddress: string; shieldedCoinPublicKey?: string } | string[]>;
    getDustAddress?: () => Promise<{ dustAddress: string } | string>;
    state?: () => Promise<{ coinPublicKey?: string; address?: string }>;
  }>;
  // Legacy / fallback API
  enable?: () => Promise<{
    state?: () => Promise<{ coinPublicKey?: string; address?: string }>;
    getUnshieldedAddress?: () => Promise<{ unshieldedAddress: string } | string>;
  }>;
  isEnabled?: () => Promise<boolean>;
}

interface DetectedWallet {
  key: string;
  provider: MidnightWalletProvider;
  name: string;
  icon?: string;
}

// ─── Detect all wallets injected under window.midnight and global window ─────
function detectWallets(): DetectedWallet[] {
  try {
    const w = window as any;
    const detected: DetectedWallet[] = [];

    // Helper to evaluate a candidate provider object
    const checkCandidate = (key: string, provider: any) => {
      if (!provider || typeof provider !== 'object') return;
      const hasConnect = typeof provider.connect === 'function';
      const hasEnable = typeof provider.enable === 'function';

      if (hasConnect || hasEnable) {
        const rawName = provider.name || key;
        let name = rawName;
        if (/lace/i.test(rawName)) name = 'Midnight Lace';
        else if (/1am|oneam/i.test(rawName)) name = '1AM Wallet';

        detected.push({
          key,
          provider: provider as MidnightWalletProvider,
          name,
          icon: typeof provider.icon === 'string' ? provider.icon : undefined,
        });
      }
    };

    // 1. Scan window.midnight namespace (Standard CAIP-372 / Midnight specification)
    if (w.midnight && typeof w.midnight === 'object') {
      const midnightKeys = new Set([
        ...Object.getOwnPropertyNames(w.midnight),
        ...Object.keys(w.midnight),
        '1AM', '1am', 'oneam', 'mnLace', 'lace', 'midnight'
      ]);

      for (const key of midnightKeys) {
        try {
          checkCandidate(key, w.midnight[key]);
        } catch {
          // ignore accessor errors
        }
      }

      // In case window.midnight itself is the provider
      checkCandidate('midnight', w.midnight);
    }

    // 2. Scan direct window global injections (fallbacks)
    const directGlobals = ['mnLace', 'lace', '1AM', 'oneam', 'oneAmWallet'];
    for (const key of directGlobals) {
      if (w[key]) {
        checkCandidate(key, w[key]);
      }
    }

    // Deduplicate by provider instance reference
    const unique = new Map<any, DetectedWallet>();
    for (const wallet of detected) {
      unique.set(wallet.provider, wallet);
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}

// ─── Poll until wallets appear or timeout ────────────────────────────────────
async function pollForWallets(
  maxMs = 5000,
  intervalMs = 400,
  onUpdate?: (wallets: DetectedWallet[]) => void
): Promise<DetectedWallet[]> {
  return new Promise(resolve => {
    const start = Date.now();
    const tick = () => {
      const found = detectWallets();
      if (onUpdate) onUpdate(found);
      if (found.length > 0 || Date.now() - start >= maxMs) {
        resolve(found);
      } else {
        setTimeout(tick, intervalMs);
      }
    };
    tick();
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string, method: 'lace' | 'manual') => void;
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [tab, setTab] = useState<'extension' | 'manual'>('extension');
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [inputError, setInputError] = useState('');
  const [isConnecting, setIsConnecting] = useState<string | null>(null); // key of wallet being connected
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Detection logic ─────────────────────────────────────────────────────────
  const runDetection = useCallback(() => {
    setDetecting(true);
    setWallets([]);
    pollForWallets(6000, 300, (found) => setWallets(found)).then(found => {
      setWallets(found);
      setDetecting(false);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      runDetection();
      setInputError('');
      setManualAddress('');
      setTab('extension');
    }
  }, [isOpen, runDetection]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  // Focus manual input
  useEffect(() => {
    if (tab === 'manual' && isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [tab, isOpen]);

  if (!isOpen) return null;

  // ── Connect via extension (handles connect() or enable()) ────────────────────
  const handleExtensionConnect = async (wallet: DetectedWallet) => {
    setIsConnecting(wallet.key);
    setInputError('');
    try {
      let rawAddr = '';

      // Standard Midnight DApp Connector v4 API
      if (typeof wallet.provider.connect === 'function') {
        const connected = await wallet.provider.connect('preprod');
        
        // 1. Try unshielded address
        if (connected.getUnshieldedAddress) {
          const res = await connected.getUnshieldedAddress();
          rawAddr = typeof res === 'string' ? res : res?.unshieldedAddress || '';
        }
        
        // 2. Try shielded address if unshielded not available
        if (!rawAddr && connected.getShieldedAddresses) {
          const res = await connected.getShieldedAddresses();
          if (Array.isArray(res)) {
            rawAddr = res[0] || '';
          } else if (res) {
            rawAddr = res.shieldedAddress || res.shieldedCoinPublicKey || '';
          }
        }

        // 3. Try state() fallback
        if (!rawAddr && connected.state) {
          const st = await connected.state();
          rawAddr = st?.coinPublicKey || st?.address || '';
        }
      } 
      // Legacy Midnight Lace API
      else if (typeof wallet.provider.enable === 'function') {
        const api = await wallet.provider.enable();
        if (api.getUnshieldedAddress) {
          const res = await api.getUnshieldedAddress();
          rawAddr = typeof res === 'string' ? res : res?.unshieldedAddress || '';
        }
        if (!rawAddr && api.state) {
          const st = await api.state();
          rawAddr = st?.coinPublicKey || st?.address || '';
        }
      }

      if (!rawAddr) {
        throw new Error('Wallet connected, but no account address was returned. Ensure your wallet is unlocked on Preprod.');
      }

      const finalAddr = rawAddr.startsWith('0x') || rawAddr.startsWith('mn_addr_') ? rawAddr : '0x' + rawAddr;
      onConnect(finalAddr, 'lace');
      onClose();
    } catch (err: any) {
      setInputError(err?.message || 'Connection rejected or wallet authorization failed.');
    } finally {
      setIsConnecting(null);
    }
  };


  // ── Connect via manual address ──────────────────────────────────────────────
  const handleManualConnect = () => {
    const addr = manualAddress.trim();
    if (!addr) { setInputError('Please enter a wallet address.'); return; }
    const isHex = /^(0x)?[0-9a-fA-F]{32,}$/.test(addr);
    const isBech32 = /^mn_addr_(preprod|mainnet)1[a-z0-9]{30,}$/.test(addr);
    if (!isHex && !isBech32) {
      setInputError('Invalid format. Accepted: mn_addr_preprod1... (bech32) or 0x... (hex 32+ chars).');
      return;
    }
    onConnect(isHex && !addr.startsWith('0x') ? '0x' + addr : addr, 'manual');
    onClose();
  };

  const noWalletsFound = !detecting && wallets.length === 0;

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        animation: 'wm-fade 0.15s ease',
      }}
    >
      <div style={{
        background: '#0c0c0e', border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '1.1rem', width: '100%', maxWidth: 460,
        boxShadow: '0 32px 96px rgba(0,0,0,0.8)', overflow: 'hidden',
        animation: 'wm-slide 0.2s ease',
      }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f1f1' }}>Connect Wallet</div>
              <div style={{ fontSize: '0.71rem', color: '#555', marginTop: 1 }}>Midnight Network · Preprod</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#999')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
            <X size={18} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem' }}>
          {([['extension', '🔌 Browser Wallet'], ['manual', '🔑 Manual Address']] as const).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setInputError(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.7rem 0', marginRight: '1.5rem', fontSize: '0.82rem', fontWeight: 500, color: tab === t ? '#f1f1f1' : '#555', borderBottom: tab === t ? '2px solid #8b5cf6' : '2px solid transparent', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '1.5rem' }}>

          {tab === 'extension' && (
            <div>
              {/* Detection status */}
              {detecting && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', marginBottom: '1rem', fontSize: '0.8rem' }}>
                  <Loader2 size={14} style={{ animation: 'wm-spin 1s linear infinite' }} />
                  Scanning for installed Midnight wallets…
                </div>
              )}

              {/* Detected wallets list */}
              {wallets.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#555', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                    {wallets.length} wallet{wallets.length > 1 ? 's' : ''} detected
                  </div>
                  {wallets.map(wallet => (
                    <button
                      key={wallet.key}
                      onClick={() => handleExtensionConnect(wallet)}
                      disabled={isConnecting !== null}
                      style={{
                        width: '100%', marginBottom: '0.5rem', padding: '0.85rem 1rem',
                        background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)',
                        borderRadius: 10, cursor: isConnecting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.15s', opacity: isConnecting && isConnecting !== wallet.key ? 0.4 : 1,
                      }}
                      onMouseEnter={e => { if (!isConnecting) { e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.06)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Wallet size={15} color="#fff" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ color: '#f1f1f1', fontSize: '0.875rem', fontWeight: 600 }}>{wallet.name}</div>
                          <div style={{ color: '#555', fontSize: '0.72rem', marginTop: 1 }}>
                            {wallet.provider.apiVersion ? `v${wallet.provider.apiVersion}` : 'DApp Connector'}
                          </div>
                        </div>
                      </div>
                      {isConnecting === wallet.key ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b5cf6', fontSize: '0.78rem' }}>
                          <Loader2 size={13} style={{ animation: 'wm-spin 1s linear infinite' }} /> Authorizing…
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#555', fontSize: '0.78rem' }}>
                          Connect <ChevronRight size={13} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* No wallets found */}
              {noWalletsFound && (
                <div style={{ padding: '1rem', borderRadius: 10, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <AlertCircle size={14} /> No Midnight wallet detected
                  </div>
                  <p style={{ margin: '0 0 0.65rem', fontSize: '0.78rem', color: '#777', lineHeight: 1.65 }}>
                    Install a Midnight-compatible wallet extension, then refresh and try again.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <a href="https://midnight.network/get-lace" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 500 }}>
                      Get Midnight Lace <ExternalLink size={11} />
                    </a>
                    <a href="https://www.1amwallet.com" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 500 }}>
                      Get 1AM Wallet <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              )}

              {/* Retry & install links */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: inputError ? '0.75rem' : 0 }}>
                <button onClick={runDetection} disabled={detecting}
                  style={{ flex: 1, padding: '0.6rem', background: 'none', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, cursor: detecting ? 'not-allowed' : 'pointer', color: '#666', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!detecting) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.color = '#aaa'; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#666'; }}>
                  <RefreshCw size={12} style={detecting ? { animation: 'wm-spin 1s linear infinite' } : {}} />
                  {detecting ? 'Scanning…' : 'Re-scan'}
                </button>
                <button onClick={() => setTab('manual')}
                  style={{ flex: 1, padding: '0.6rem', background: 'none', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, cursor: 'pointer', color: '#666', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.color = '#aaa'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#666'; }}>
                  <Key size={12} /> Enter address manually
                </button>
              </div>

              {/* Connection error */}
              {inputError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '0.65rem 0.8rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: '0.78rem', lineHeight: 1.5 }}>
                  <AlertCircle size={13} style={{ marginTop: 1, flexShrink: 0 }} /> {inputError}
                </div>
              )}

              {/* Tip when wallets found */}
              {wallets.length > 0 && !inputError && (
                <div style={{ marginTop: '0.9rem', fontSize: '0.75rem', color: '#444', lineHeight: 1.6 }}>
                  💡 If your wallet isn't listed, try <strong style={{ color: '#666' }}>re-scanning</strong> or check the browser console for <code style={{ color: '#555' }}>window.midnight</code>.
                </div>
              )}
            </div>
          )}

          {tab === 'manual' && (
            <div>
              <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 1rem', lineHeight: 1.7 }}>
                Paste your <strong style={{ color: '#ccc' }}>Midnight wallet address</strong>. Supports Lace bech32 and hex formats.
              </p>
              <label style={{ display: 'block', fontSize: '0.71rem', color: '#555', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Wallet Address
              </label>
              <input
                ref={inputRef}
                type="text"
                value={manualAddress}
                onChange={e => { setManualAddress(e.target.value); setInputError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handleManualConnect(); }}
                placeholder="mn_addr_preprod1...  or  0x..."
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '0.72rem 0.9rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${inputError ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: 9, color: '#f1f1f1', fontSize: '0.82rem', outline: 'none',
                  fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.4rem',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(139,92,246,0.55)')}
                onBlur={e => (e.currentTarget.style.borderColor = inputError ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.09)')}
              />
              {inputError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f87171', fontSize: '0.75rem', marginBottom: '0.6rem' }}>
                  <AlertCircle size={12} /> {inputError}
                </div>
              )}
              <div style={{ fontSize: '0.72rem', color: '#444', marginBottom: '1.25rem', padding: '0.55rem 0.7rem', background: 'rgba(255,255,255,0.02)', borderRadius: 7 }}>
                ✓ <code style={{ color: '#666' }}>mn_addr_preprod1...</code> · ✓ <code style={{ color: '#666' }}>mn_addr_mainnet1...</code> · ✓ <code style={{ color: '#666' }}>0x...</code> (32+ hex chars)
              </div>
              <button onClick={handleManualConnect} style={{
                width: '100%', padding: '0.78rem 1rem',
                background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                border: 'none', borderRadius: 9, cursor: 'pointer',
                color: '#fff', fontSize: '0.875rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Key size={15} /> Connect with Address
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '0.7rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.71rem', color: '#3a3a3a' }}>
          <span>🔒</span>
          <span>Your address is never sent server-side. ZK proofs run locally in your browser.</span>
        </div>
      </div>

      <style>{`
        @keyframes wm-fade  { from { opacity:0 } to { opacity:1 } }
        @keyframes wm-slide { from { transform:translateY(14px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        @keyframes wm-spin  { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
      `}</style>
    </div>
  );
}
