import { HttpProverClient } from '@midnight-ntwrk/wallet-sdk-prover-client/effect';
import { Effect, pipe } from 'effect';
import axios from 'axios';

async function main() {
  console.log('Testing proof server HTTP connection...');
  try {
    const res = await axios.post('http://localhost:6300/prove', Buffer.from([0, 1, 2, 3]), {
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    console.log('Response status:', res.status);
  } catch (err: any) {
    console.log('Error status:', err.response?.status);
    console.log('Error data:', err.response?.data);
  }
}

main().catch(console.error);
