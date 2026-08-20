import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { randomBytes } from 'crypto';

// Set network to Midnight Preprod
setNetworkId('preprod');

async function main() {
  const seed = randomBytes(32).toString('hex');
  console.log('----------------------------------------------------');
  console.log('🔑 Midnight Preprod Deployment Wallet Generator');
  console.log('----------------------------------------------------');
  console.log(`Wallet Seed (Hex): ${seed}`);
  
  try {
    // Generate sample preprod unshielded address
    console.log(`Network: Midnight Preprod Testnet`);
    console.log(`Faucet URL: https://midnight-tmnight-preprod.nethermind.dev/`);
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('Error deriving address:', err);
  }
}

main();
