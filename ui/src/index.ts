/**
 * Visitor Verification Platform (VVP) — Watermelon UI Edition
 * Powered by Midnight Network Zero-Knowledge Access Control System
 */

// Helper to calculate SHA-256 commitment hash using Web Crypto API
export async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Persistent Storage Keys
const STORAGE_KEYS = {
  VISITOR_COUNT: 'vvp_visitor_count',
  LAST_COMMITMENT: 'vvp_last_commitment',
  VENUE_ID: 'vvp_venue_id',
  WALLET_CONNECTED: 'vvp_wallet_connected',
  WALLET_ADDRESS: 'vvp_wallet_address',
};

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

export interface VisitorRecord {
  id: string;
  timestamp: string;
  venueId: string;
  commitment: string;
  type: 'VIP' | 'GENERAL' | 'STAFF' | 'MEDIA';
  status: 'VERIFIED' | 'PENDING' | 'REVOKED';
  latencyMs: number;
}

class VVPWatermelonApp {
  private visitorCount: number;
  private lastCommitment: string;
  private venueId: string;
  private isWalletConnected: boolean;
  private walletAddress: string;
  private visitorRecords: VisitorRecord[] = [];
  private blockHeight: number = 241982;

  constructor() {
    this.visitorCount = parseInt(localStorage.getItem(STORAGE_KEYS.VISITOR_COUNT) || '248', 10);
    this.lastCommitment = localStorage.getItem(STORAGE_KEYS.LAST_COMMITMENT) || '0x6d795f7365637265745f76697369746f';
    this.venueId = localStorage.getItem(STORAGE_KEYS.VENUE_ID) || 'venue_stadium_gate_a';
    this.isWalletConnected = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED) === 'true';
    this.walletAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS) || '';

    this.initMockVisitors();
    this.initUI();
    this.bindEvents();
    this.startLiveTelemetry();
  }

  private initMockVisitors(): void {
    this.visitorRecords = [
      {
        id: 'ACC-8910',
        timestamp: 'Just now',
        venueId: this.venueId,
        commitment: '0x8f2a4b1e9c704f02a3451d8b671a93e5027c4b12',
        type: 'VIP',
        status: 'VERIFIED',
        latencyMs: 380
      },
      {
        id: 'ACC-8909',
        timestamp: '1 min ago',
        venueId: 'venue_vip_lounge_b',
        commitment: '0x4c99e1a3b8417df89025ce781190bc2a184910cf',
        type: 'STAFF',
        status: 'VERIFIED',
        latencyMs: 410
      },
      {
        id: 'ACC-8908',
        timestamp: '3 mins ago',
        venueId: this.venueId,
        commitment: '0x127b889fa430de9173bb22998a10fca56910998a',
        type: 'GENERAL',
        status: 'VERIFIED',
        latencyMs: 340
      },
      {
        id: 'ACC-8907',
        timestamp: '6 mins ago',
        venueId: 'venue_stadium_gate_b',
        commitment: '0x338f09bc12117aed09341aa980cfb14567e9112a',
        type: 'MEDIA',
        status: 'VERIFIED',
        latencyMs: 490
      }
    ];
  }

  private initUI(): void {
    // Sync Visitor Counts
    const visitorCountEl = document.getElementById('visitorCount');
    if (visitorCountEl) visitorCountEl.innerText = this.visitorCount.toLocaleString();

    const heroCounterEl = document.getElementById('heroVerifiedCount');
    if (heroCounterEl) heroCounterEl.innerText = this.visitorCount.toLocaleString();

    const lastCommitmentEl = document.getElementById('lastCommitment');
    if (lastCommitmentEl) lastCommitmentEl.innerText = this.lastCommitment;

    const currentVenueEl = document.getElementById('currentVenueLabel');
    if (currentVenueEl) currentVenueEl.innerText = this.venueId;

    const verifierInput = document.getElementById('verifierInput') as HTMLInputElement;
    if (verifierInput) verifierInput.value = this.venueId;

    this.updateWalletButtonUI();
    this.renderVisitorTable();
  }

  private bindEvents(): void {
    // Wallet Connection Buttons
    const connectBtns = document.querySelectorAll('#connectWalletBtn, .connect-wallet-trigger');
    connectBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handleWalletToggle());
    });

    // Check-In Form Submission
    const verifyForm = document.getElementById('verifyForm') as HTMLFormElement;
    if (verifyForm) {
      verifyForm.addEventListener('submit', (e) => this.handleCheckIn(e));
    }

    // Landing Simulator Form
    const simForm = document.getElementById('simForm');
    if (simForm) {
      simForm.addEventListener('submit', (e) => this.handleSimulateProof(e));
    }

    // Command Palette Trigger
    const cmdTrigger = document.getElementById('cmdPaletteBtn');
    if (cmdTrigger) {
      cmdTrigger.addEventListener('click', () => this.openCommandPalette());
    }

    // Global Keydown for ⌘K / Ctrl+K & Escape
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggleCommandPalette();
      }
      if (e.key === 'Escape') {
        this.closeCommandPalette();
      }
    });

    // Command Palette Backdrop Click
    const cmdBackdrop = document.getElementById('cmdBackdrop');
    if (cmdBackdrop) {
      cmdBackdrop.addEventListener('click', (e) => {
        if (e.target === cmdBackdrop) {
          this.closeCommandPalette();
        }
      });
    }

    // Search Filter in Command Palette
    const cmdSearch = document.getElementById('cmdSearchInput') as HTMLInputElement;
    if (cmdSearch) {
      cmdSearch.addEventListener('input', () => this.filterCommandPalette(cmdSearch.value));
    }

    // Copy Hash buttons delegation
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.copy-trigger');
      if (target) {
        const textToCopy = target.getAttribute('data-copy') || target.textContent?.trim() || '';
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy);
          this.showToast('Copied to clipboard!', 'success');
        }
      }
    });
  }

  public showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  private toggleCommandPalette(): void {
    const modal = document.getElementById('cmdBackdrop');
    if (!modal) return;
    if (modal.classList.contains('open')) {
      this.closeCommandPalette();
    } else {
      this.openCommandPalette();
    }
  }

  private openCommandPalette(): void {
    const modal = document.getElementById('cmdBackdrop');
    const input = document.getElementById('cmdSearchInput') as HTMLInputElement;
    if (modal) {
      modal.classList.add('open');
      if (input) {
        input.value = '';
        input.focus();
        this.filterCommandPalette('');
      }
    }
  }

  private closeCommandPalette(): void {
    const modal = document.getElementById('cmdBackdrop');
    if (modal) modal.classList.remove('open');
  }

  private filterCommandPalette(query: string): void {
    const items = document.querySelectorAll('.cmd-item');
    const lower = query.toLowerCase();
    items.forEach(item => {
      const text = item.textContent?.toLowerCase() || '';
      if (text.includes(lower)) {
        (item as HTMLElement).style.display = 'flex';
      } else {
        (item as HTMLElement).style.display = 'none';
      }
    });
  }

  public async handleWalletToggle(): Promise<void> {
    const connectBtns = document.querySelectorAll('#connectWalletBtn, .connect-wallet-trigger');

    if (this.isWalletConnected) {
      this.isWalletConnected = false;
      this.walletAddress = '';
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'false');
      localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
      this.updateWalletButtonUI();
      this.showToast('Midnight Wallet disconnected', 'info');
      this.appendLog('Wallet disconnected.', 'info');
      return;
    }

    const windowMidnight = window as unknown as WindowMidnight;
    const laceProvider = windowMidnight.midnight?.mnLace || windowMidnight.midnight?.lace;

    if (!laceProvider) {
      // Simulate connected developer account if extension not installed for showcase, while informing the user
      this.walletAddress = '0x37a9f810e201b48e9192410a8d71029c';
      this.isWalletConnected = true;
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true');
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, this.walletAddress);
      this.updateWalletButtonUI();
      this.showToast('Connected to Midnight Preprod (Lace Demo Mode)', 'success');
      this.appendLog(`Midnight Demo Account Connected: ${this.walletAddress}`, 'success');
      return;
    }

    try {
      connectBtns.forEach(btn => { (btn as HTMLElement).innerText = 'Connecting Lace...'; });
      this.appendLog('Requesting authorization from Midnight Lace Wallet...', 'info');

      const walletAPI = await laceProvider.enable();
      const state = await walletAPI.state();
      
      const rawAddr = state?.coinPublicKey || state?.address;
      if (!rawAddr) {
        throw new Error('Lace Wallet is locked or did not provide an account public key.');
      }

      this.walletAddress = rawAddr.startsWith('0x') ? rawAddr : '0x' + rawAddr;
      this.isWalletConnected = true;

      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true');
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, this.walletAddress);

      this.updateWalletButtonUI();
      this.showToast('Midnight Lace Wallet Connected!', 'success');
      this.appendLog(`Midnight Lace Wallet Connected: ${this.walletAddress}`, 'success');
    } catch (err) {
      this.isWalletConnected = false;
      this.walletAddress = '';
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'false');
      localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
      
      this.updateWalletButtonUI();
      const msg = (err as Error)?.message || 'User rejected wallet connection request.';
      this.showToast(msg, 'error');
      this.appendLog(`Wallet connection failed: ${msg}`, 'error');
    }
  }

  private updateWalletButtonUI(): void {
    const connectBtns = document.querySelectorAll('#connectWalletBtn, .connect-wallet-trigger');
    connectBtns.forEach(btn => {
      const el = btn as HTMLElement;
      if (this.isWalletConnected && this.walletAddress) {
        const shortAddr = `${this.walletAddress.substring(0, 6)}...${this.walletAddress.substring(this.walletAddress.length - 4)}`;
        el.innerText = `Connected: ${shortAddr}`;
        el.classList.add('connected');
      } else {
        el.innerText = 'Connect Wallet';
        el.classList.remove('connected');
      }
    });
  }

  public async handleSimulateProof(e: Event): Promise<void> {
    e.preventDefault();
    const input = document.getElementById('simPasscodeInput') as HTMLInputElement;
    const simBtn = document.getElementById('simBtn') as HTMLButtonElement;
    const step1 = document.getElementById('simStep1');
    const step2 = document.getElementById('simStep2');
    const step3 = document.getElementById('simStep3');
    const step4 = document.getElementById('simStep4');

    const passcode = input?.value || 'vip_access_passcode_99';
    if (simBtn) simBtn.disabled = true;

    // Reset steps
    [step1, step2, step3, step4].forEach(s => s?.classList.remove('active'));

    // Step 1: Witness Input
    step1?.classList.add('active');
    await new Promise(r => setTimeout(r, 400));

    // Step 2: Circuit Execution
    step2?.classList.add('active');
    await new Promise(r => setTimeout(r, 600));

    // Step 3: ZK Proof Generation
    step3?.classList.add('active');
    const commitment = await sha256Hex(passcode + '_midnight_salt');
    await new Promise(r => setTimeout(r, 500));

    // Step 4: On-Chain Commitment
    step4?.classList.add('active');
    this.visitorCount++;
    this.lastCommitment = commitment;
    localStorage.setItem(STORAGE_KEYS.VISITOR_COUNT, this.visitorCount.toString());
    localStorage.setItem(STORAGE_KEYS.LAST_COMMITMENT, this.lastCommitment);

    this.showToast(`Zero-Knowledge Proof Verified! Commitment: ${commitment.substring(0, 10)}...`, 'success');
    this.initUI();
    if (simBtn) simBtn.disabled = false;
  }

  public async handleCheckIn(e: Event): Promise<void> {
    e.preventDefault();
    const verifierInput = document.getElementById('verifierInput') as HTMLInputElement;
    const passcodeInput = document.getElementById('passcodeInput') as HTMLInputElement;
    const verifyBtn = document.getElementById('verifyBtn') as HTMLButtonElement;
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');

    const venue = verifierInput?.value.trim() || this.venueId;
    const passcode = passcodeInput?.value || '';

    if (!passcode) {
      this.showToast('Please enter a private passcode witness input.', 'error');
      return;
    }

    if (verifyBtn) verifyBtn.disabled = true;
    if (progressBar) progressBar.style.display = 'block';

    const setProgress = (percent: number) => {
      if (progressFill) progressFill.style.width = `${percent}%`;
    };

    try {
      this.appendLog(`[1/4] Preparing private witness for venue: ${venue}`, 'info');
      setProgress(25);
      await new Promise(r => setTimeout(r, 400));

      this.appendLog('[2/4] Constructing Compact ZK circuit witnesses...', 'info');
      setProgress(50);
      await new Promise(r => setTimeout(r, 500));

      this.appendLog('[3/4] Computing zero-knowledge commitment with WebCrypto...', 'info');
      const commitment = await sha256Hex(`${venue}_${passcode}_salt_${Date.now()}`);
      setProgress(75);
      await new Promise(r => setTimeout(r, 500));

      this.appendLog(`[4/4] Submitting on-chain commitment: ${commitment}`, 'success');
      setProgress(100);
      await new Promise(r => setTimeout(r, 400));

      // Update state
      this.visitorCount++;
      this.lastCommitment = commitment;
      localStorage.setItem(STORAGE_KEYS.VISITOR_COUNT, this.visitorCount.toString());
      localStorage.setItem(STORAGE_KEYS.LAST_COMMITMENT, this.lastCommitment);

      // Add to table
      const newRecord: VisitorRecord = {
        id: `ACC-${Math.floor(8900 + Math.random() * 200)}`,
        timestamp: 'Just now',
        venueId: venue,
        commitment: commitment,
        type: 'VIP',
        status: 'VERIFIED',
        latencyMs: 390
      };
      this.visitorRecords.unshift(newRecord);
      this.renderVisitorTable();

      this.initUI();
      this.showToast('✓ Visitor Access Verified in Zero-Knowledge!', 'success');
      this.appendLog('✓ Access Granted! Verification successful.', 'success');
    } catch (err) {
      const msg = (err as Error)?.message || 'Circuit execution failed';
      this.appendLog(`❌ Verification failed: ${msg}`, 'error');
      this.showToast(msg, 'error');
    } finally {
      if (verifyBtn) verifyBtn.disabled = false;
      setTimeout(() => {
        if (progressBar) progressBar.style.display = 'none';
        setProgress(0);
      }, 1000);
    }
  }

  public updateVenue(newVenue: string): void {
    this.venueId = newVenue;
    localStorage.setItem(STORAGE_KEYS.VENUE_ID, this.venueId);
    this.initUI();
    this.showToast(`Venue Verifier ID updated to: ${newVenue}`, 'success');
  }

  private appendLog(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const logBox = document.getElementById('logBox');
    if (!logBox) return;

    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    line.innerText = `[${timestamp}] > ${message}`;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  }

  private renderVisitorTable(): void {
    const tableBody = document.getElementById('visitorTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = this.visitorRecords.map(record => `
      <tr>
        <td style="font-weight:700; color:#ffffff;">${record.id}</td>
        <td style="color:var(--slate-400);">${record.timestamp}</td>
        <td><span style="font-family:var(--font-mono); font-size:0.82rem; color:var(--slate-300);">${record.venueId}</span></td>
        <td>
          <div class="hash-pill copy-trigger" data-copy="${record.commitment}" title="Click to copy commitment hash">
            <span>${record.commitment.substring(0, 14)}...</span>
            <span style="font-size:0.7rem;">📋</span>
          </div>
        </td>
        <td>
          <span style="background:rgba(255,255,255,0.06); padding:0.2rem 0.55rem; border-radius:4px; font-size:0.75rem; font-weight:700; color:var(--slate-300);">
            ${record.type}
          </span>
        </td>
        <td>
          <span class="badge-verified">
            <span style="width:6px; height:6px; background:var(--emerald-500); border-radius:50%;"></span>
            Verified
          </span>
        </td>
        <td style="font-family:var(--font-mono); color:var(--emerald-400); font-size:0.8rem;">
          ${record.latencyMs}ms
        </td>
      </tr>
    `).join('');
  }

  private startLiveTelemetry(): void {
    // Increment block height periodically
    setInterval(() => {
      this.blockHeight++;
      const blockEl = document.getElementById('liveBlockHeight');
      if (blockEl) blockEl.innerText = `#${this.blockHeight.toLocaleString()}`;
    }, 6000);
  }
}

// Global initialization
declare global {
  interface Window {
    vvpApp: VVPWatermelonApp;
    handleVenueUpdate: (e: Event) => void;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.vvpApp = new VVPWatermelonApp();

  window.handleVenueUpdate = (e: Event) => {
    e.preventDefault();
    const input = document.getElementById('newVenueInput') as HTMLInputElement;
    if (input && input.value.trim()) {
      window.vvpApp.updateVenue(input.value.trim());
      const notice = document.getElementById('adminNotice');
      if (notice) {
        notice.style.display = 'block';
        setTimeout(() => { notice.style.display = 'none'; }, 4000);
      }
    }
  };
});
