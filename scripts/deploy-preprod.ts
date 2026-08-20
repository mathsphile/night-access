import { pino } from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightWalletProvider } from '../bboard-cli/src/midnight-wallet-provider.js';
import { getInitialUnshieldedState } from '../bboard-cli/src/wallet-utils.js';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { BBoardAPI } from '../api/src/index.js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { generateDust } from '../bboard-cli/src/generate-dust.js';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import * as Rx from 'rxjs';
import fs from 'fs';
import path from 'path';
import { WebSocket } from 'ws';

// @ts-expect-error: WebSocket polyfill for apollo/graphql subscription
globalThis.WebSocket = WebSocket;

setNetworkId('preprod');

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

async function main() {
  console.log('\n============================================================');
  console.log('🚀 MIDNIGHT PREPROD SMART CONTRACT DEPLOYER');
  console.log('============================================================\n');

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

  logger.info('Initializing Midnight Preprod wallet...');
  const walletProvider = await MidnightWalletProvider.build(logger, envConfig, seed);
  await walletProvider.start();

  const initialState = await getInitialUnshieldedState(logger, walletProvider.wallet.unshielded);
  const unshieldedAddress = UnshieldedAddress.codec.encode('preprod', initialState.address);

  console.log(`📍 Deployment Wallet Address: ${unshieldedAddress.toString()}`);
  console.log(`⏳ Synchronizing balance on Midnight Preprod...`);

  // Wait for unshielded wallet state emission with funds
  const token = unshieldedToken();
  const unshieldedState = await Rx.firstValueFrom(
    walletProvider.wallet.unshielded.state.pipe(
      Rx.filter((state) => (state.balances[token.raw] ?? 0n) > 0n),
      Rx.timeout({ each: 15000, with: () => Rx.firstValueFrom(walletProvider.wallet.unshielded.state) }),
    ),
  );

  const nightBalance = unshieldedState.balances[token.raw] ?? 0n;

  if (nightBalance === 0n) {
    console.log('\n❌ [INSUFFICIENT FUNDS] Wallet balance is currently 0 tNIGHT.');
    console.log('------------------------------------------------------------');
    console.log(`To fund this wallet for free on the Midnight Preprod testnet:`);
    console.log(`1. Open Faucet: https://midnight-tmnight-preprod.nethermind.dev/`);
    console.log(`2. Paste Address: ${unshieldedAddress.toString()}`);
    console.log(`3. Request test tokens (tDUST / tNIGHT)`);
    console.log(`4. Once transaction confirms, re-run: npm run deploy:preprod`);
    console.log('------------------------------------------------------------\n');
    await walletProvider.stop().catch(() => {});
    process.exit(0);
  }

  console.log(`\n✅ Confirmed Wallet Balance: ${nightBalance.toString()} tNIGHT`);

  // Register UTXOs for DUST generation if needed
  console.log('⚡ Registering tNIGHT UTXOs for DUST transaction fee generation...');
  try {
    const txId = await generateDust(logger, seed, unshieldedState, walletProvider.wallet);
    if (txId) {
      console.log(`✅ DUST generation transaction submitted: ${txId}`);
    }
  } catch (err: any) {
    logger.warn(`DUST generation notification: ${err?.message || err}`);
  }

  console.log(`🚀 Compiling ZK Circuit Witnesses and Submitting Transaction to Midnight Preprod...`);

  try {
    const zkConfigPath = path.resolve(process.cwd(), 'contract', 'src', 'managed', 'bboard');
    const providers = {
      midnightProvider: walletProvider,
      walletProvider: walletProvider,
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: 'vvp-preprod-state',
        accountId: unshieldedAddress.toString(),
        privateStoragePasswordProvider: () => Promise.resolve('visitor-verification-platform-secure-key-12345'),
      }),
      publicDataProvider: indexerPublicDataProvider(envConfig.indexer, envConfig.indexerWS),
      zkConfigProvider: new NodeZkConfigProvider<any>(zkConfigPath),
      proofProvider: httpClientProofProvider(envConfig.proofServer),
    };

    logger.info('Submitting contract deployment on Midnight Preprod...');
    const api = await BBoardAPI.deploy(providers, logger);
    const deployedAddress = api.deployedContractAddress;

    console.log('\n============================================================');
    console.log('🎉 SMART CONTRACT DEPLOYED ON MIDNIGHT PREPROD!');
    console.log('============================================================');
    console.log(`📍 Deployed Contract Address: ${deployedAddress}`);
    console.log(`🌐 Network: Midnight Preprod`);
    console.log(`🔗 Explorer: https://explorer.preprod.midnight.network/contract/${deployedAddress}`);
    console.log('============================================================\n');

    // Update .env with deployed contract address
    let envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, 'utf-8') : '';
    if (envContent.includes('MIDNIGHT_DEPLOYED_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(/MIDNIGHT_DEPLOYED_CONTRACT_ADDRESS=.*/, `MIDNIGHT_DEPLOYED_CONTRACT_ADDRESS=${deployedAddress}`);
    } else {
      envContent += `\nMIDNIGHT_DEPLOYED_CONTRACT_ADDRESS=${deployedAddress}\n`;
    }
    fs.writeFileSync(envFilePath, envContent);

    console.log('✅ Updated .env with deployed contract address.');
  } catch (err: any) {
    console.error('\n❌ Deployment transaction error:', err?.message || err);
  } finally {
    await walletProvider.stop().catch(() => {});
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('❌ Deployment error:', err);
  process.exit(1);
});
