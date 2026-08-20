import { pino } from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightWalletProvider } from '../bboard-cli/src/midnight-wallet-provider.js';
import { getInitialUnshieldedState } from '../bboard-cli/src/wallet-utils.js';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

setNetworkId('preprod');

const logger = pino({
  level: 'error',
});

async function main() {
  const envFilePath = path.resolve(process.cwd(), '.env');
  let seed = '4c89a01f92e4785b8c310248ad912efc4710924b1728e9a0342981f9b027ca81';

  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, 'utf-8');
    const match = envContent.match(/MIDNIGHT_WALLET_SEED=([a-fA-F0-9]+)/);
    if (match && match[1]) {
      seed = match[1];
    }
  }

  const envConfig: EnvironmentConfiguration = {
    walletNetworkId: 'preprod',
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    nodeWS: 'wss://rpc.preprod.midnight.network',
    faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
    proofServer: process.env.PROOF_SERVER_URL || 'http://localhost:6300',
  };

  const walletProvider = await MidnightWalletProvider.build(logger, envConfig, seed);
  const initialState = await getInitialUnshieldedState(logger, walletProvider.wallet.unshielded);
  const unshieldedAddress = UnshieldedAddress.codec.encode('preprod', initialState.address);
  const coinPublicKey = walletProvider.getCoinPublicKey();

  // Update .env with deterministic address
  const envData = `# Midnight Preprod Deployment Wallet\nMIDNIGHT_WALLET_SEED=${seed}\nMIDNIGHT_UNSHIELDED_ADDRESS=${unshieldedAddress.toString()}\n`;
  fs.writeFileSync(envFilePath, envData);

  console.log('\n============================================================');
  console.log('💎 MIDNIGHT PREPROD DEPLOYMENT WALLET DETAILS');
  console.log('============================================================');
  console.log(`🌐 Network:            Midnight Preprod`);
  console.log(`📍 Unshielded Address: ${unshieldedAddress.toString()}`);
  console.log(`🔑 Shielded Public Key: ${coinPublicKey.toString()}`);
  console.log(`💧 Faucet URL:         https://midnight-tmnight-preprod.nethermind.dev/`);
  console.log('============================================================');
  console.log('Instructions to Fund:');
  console.log('1. Open: https://midnight-tmnight-preprod.nethermind.dev/');
  console.log(`2. Paste your address: ${unshieldedAddress.toString()}`);
  console.log('3. Request test tokens (tDUST / tNIGHT)');
  console.log('4. Once received, run: npm run deploy:preprod');
  console.log('============================================================\n');

  await walletProvider.stop().catch(() => {});
  process.exit(0);
}

main().catch((err) => {
  console.error('Error generating wallet:', err);
  process.exit(1);
});
