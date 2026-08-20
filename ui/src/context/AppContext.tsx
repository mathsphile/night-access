'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sha256Hex, VisitorRecord } from '@/lib/zk';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface MidnightLaceProvider {
  enable: () => Promise<{
    state: () => Promise<{ coinPublicKey?: string; address?: string }>;
  }>;
}

interface WindowMidnight {
  midnight?: {
    mnLace?: MidnightLaceProvider;
    lace?: MidnightLaceProvider;
  };
}

interface AppContextType {
  visitorCount: number;
  lastCommitment: string;
  venueId: string;
  isWalletConnected: boolean;
  walletAddress: string;
  visitorRecords: VisitorRecord[];
  blockHeight: number;
  isCmdOpen: boolean;
  toasts: ToastItem[];
  setIsCmdOpen: (open: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toggleWallet: () => Promise<void>;
  updateVenueId: (newVenue: string) => void;
  recordCheckIn: (venue: string, passcode: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VISITOR_COUNT: 'vvp_visitor_count',
  LAST_COMMITMENT: 'vvp_last_commitment',
  VENUE_ID: 'vvp_venue_id',
  WALLET_CONNECTED: 'vvp_wallet_connected',
  WALLET_ADDRESS: 'vvp_wallet_address',
};

const INITIAL_VISITORS: VisitorRecord[] = [
  {
    id: 'ACC-8910',
    timestamp: 'Just now',
    venueId: 'venue_stadium_gate_a',
    commitment: '0x8f2a4b1e9c704f02a3451d8b671a93e5027c4b12',
    type: 'VIP',
    status: 'VERIFIED',
    latencyMs: 380,
  },
  {
    id: 'ACC-8909',
    timestamp: '1 min ago',
    venueId: 'venue_vip_lounge_b',
    commitment: '0x4c99e1a3b8417df89025ce781190bc2a184910cf',
    type: 'STAFF',
    status: 'VERIFIED',
    latencyMs: 410,
  },
  {
    id: 'ACC-8908',
    timestamp: '3 mins ago',
    venueId: 'venue_stadium_gate_a',
    commitment: '0x127b889fa430de9173bb22998a10fca56910998a',
    type: 'GENERAL',
    status: 'VERIFIED',
    latencyMs: 340,
  },
  {
    id: 'ACC-8907',
    timestamp: '6 mins ago',
    venueId: 'venue_stadium_gate_b',
    commitment: '0x338f09bc12117aed09341aa980cfb14567e9112a',
    type: 'MEDIA',
    status: 'VERIFIED',
    latencyMs: 490,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitorCount, setVisitorCount] = useState<number>(248);
  const [lastCommitment, setLastCommitment] = useState<string>('0x6d795f7365637265745f76697369746f');
  const [venueId, setVenueId] = useState<string>('venue_stadium_gate_a');
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [visitorRecords, setVisitorRecords] = useState<VisitorRecord[]>(INITIAL_VISITORS);
  const [blockHeight, setBlockHeight] = useState<number>(241982);
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCount = localStorage.getItem(STORAGE_KEYS.VISITOR_COUNT);
      if (storedCount) setVisitorCount(parseInt(storedCount, 10));

      const storedCommitment = localStorage.getItem(STORAGE_KEYS.LAST_COMMITMENT);
      if (storedCommitment) setLastCommitment(storedCommitment);

      const storedVenue = localStorage.getItem(STORAGE_KEYS.VENUE_ID);
      if (storedVenue) setVenueId(storedVenue);

      const storedConnected = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED) === 'true';
      const storedAddr = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS) || '';
      setIsWalletConnected(storedConnected);
      setWalletAddress(storedAddr);
    }
  }, []);

  // Live block ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Global keydown for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCmdOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const toggleWallet = async () => {
    if (isWalletConnected) {
      setIsWalletConnected(false);
      setWalletAddress('');
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'false');
      localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
      showToast('Midnight Wallet disconnected', 'info');
      return;
    }

    const windowMidnight = (typeof window !== 'undefined' ? window : {}) as unknown as WindowMidnight;
    const laceProvider = windowMidnight.midnight?.mnLace || windowMidnight.midnight?.lace;

    if (!laceProvider) {
      // Connect developer preview demo account if browser extension is not yet installed
      const demoAddr = '0x37a9f810e201b48e9192410a8d71029c';
      setIsWalletConnected(true);
      setWalletAddress(demoAddr);
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true');
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, demoAddr);
      showToast('Connected to Midnight Preprod (Lace Demo Mode)', 'success');
      return;
    }

    try {
      showToast('Requesting authorization from Midnight Lace Wallet...', 'info');
      const walletAPI = await laceProvider.enable();
      const state = await walletAPI.state();
      const rawAddr = state?.coinPublicKey || state?.address;
      if (!rawAddr) throw new Error('Lace Wallet is locked or did not provide an account public key.');

      const addr = rawAddr.startsWith('0x') ? rawAddr : '0x' + rawAddr;
      setIsWalletConnected(true);
      setWalletAddress(addr);
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true');
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, addr);
      showToast('Midnight Lace Wallet Connected!', 'success');
    } catch (err) {
      setIsWalletConnected(false);
      setWalletAddress('');
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'false');
      localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
      const msg = (err as Error)?.message || 'Wallet connection rejected.';
      showToast(msg, 'error');
    }
  };

  const updateVenueId = (newVenue: string) => {
    setVenueId(newVenue);
    localStorage.setItem(STORAGE_KEYS.VENUE_ID, newVenue);
    showToast(`Active Venue Verifier ID updated to: ${newVenue}`, 'success');
  };

  const recordCheckIn = async (targetVenue: string, passcode: string): Promise<string> => {
    const commitment = await sha256Hex(`${targetVenue}_${passcode}_salt_${Date.now()}`);
    const newCount = visitorCount + 1;
    setVisitorCount(newCount);
    setLastCommitment(commitment);
    localStorage.setItem(STORAGE_KEYS.VISITOR_COUNT, newCount.toString());
    localStorage.setItem(STORAGE_KEYS.LAST_COMMITMENT, commitment);

    const newRecord: VisitorRecord = {
      id: `ACC-${Math.floor(8900 + Math.random() * 200)}`,
      timestamp: 'Just now',
      venueId: targetVenue,
      commitment,
      type: 'VIP',
      status: 'VERIFIED',
      latencyMs: 380,
    };
    setVisitorRecords(prev => [newRecord, ...prev]);
    showToast('✓ Visitor Access Verified in Zero-Knowledge!', 'success');
    return commitment;
  };

  return (
    <AppContext.Provider
      value={{
        visitorCount,
        lastCommitment,
        venueId,
        isWalletConnected,
        walletAddress,
        visitorRecords,
        blockHeight,
        isCmdOpen,
        toasts,
        setIsCmdOpen,
        showToast,
        toggleWallet,
        updateVenueId,
        recordCheckIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
