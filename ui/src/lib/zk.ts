/**
 * Zero-Knowledge & Cryptography Utilities for Night Access (VVP)
 */

// Helper to calculate SHA-256 commitment hash using Web Crypto API
export async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
