import { pino } from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightWalletProvider } from '../bboard-cli/src/midnight-wallet-provider.js';
import { getInitialUnshieldedState, syncWallet } from '../bboard-cli/src/wallet-utils.js';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { BBoardAPI } from '../api/src/index.js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
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
  let seed: string | undefined;

  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, 'utf-8');
    const match = envContent.match(/MIDNIGHT_WALLET_SEED=([a-fA-F0-9]+)/);
    if (match && match[1]) {
      seed = match[1];
    }
  }

  if (!seed) {
    logger.error('No wallet seed found in .env. Please run "npm run wallet:funding" first.');
    process.exit(1);
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

  logger.info('Connecting to Midnight Preprod network...');
  const walletProvider = await MidnightWalletProvider.build(logger, envConfig, seed);
  await walletProvider.start();

  const initialState = await getInitialUnshieldedState(logger, walletProvider.wallet.unshielded);
  const unshieldedAddress = UnshieldedAddress.codec.encode('preprod', initialState.address);

  console.log(`📍 Deployment Wallet Address: ${unshieldedAddress.toString()}`);
  console.log(`⏳ Synchronizing balance on Midnight Preprod testnet...`);

  const syncedState = await syncWallet(logger, walletProvider.wallet);
  const nightBalance = syncedState.unshielded.balances[unshieldedToken().raw] ?? 0n;

  if (nightBalance === 0n) {
    console.log('\n❌ [INSUFFICIENT FUNDS] Deployment Paused');
    console.log('------------------------------------------------------------');
    console.log(`Your wallet has 0 tNIGHT / tDUST tokens.`);
    console.log(`Please request free testnet tokens from the Midnight Preprod Faucet:`);
    console.log(`🔗 Faucet URL: https://midnight-tmnight-preprod.nethermind.dev/`);
    console.log(`📍 Paste this Address: ${unshieldedAddress.toString()}`);
    console.log(`\nAfter faucet funding is received, re-run:`);
    console.log(`👉 npm run deploy:preprod`);
    console.log('------------------------------------------------------------\n');
    await walletProvider.stop().catch(() => {});
    process.exit(0);
  }

  console.log(`✅ Balance Confirmed: ${nightBalance.toString()} tNIGHT`);
  console.log(`🚀 Compiling ZK Circuit Witnesses and Submitting Transaction to Midnight Preprod...`);

  const zkConfigPath = path.resolve(process.cwd(), 'contract', 'src', 'managed', 'bboard');
  const providers = {
    midnightProvider: walletProvider,
    walletProvider: walletProvider,
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'vvp-preprod-state',
    }),
    publicDataProvider: indexerPublicDataProvider(envConfig.indexer, envConfig.indexerWS),
    zkConfigProvider: new NodeZkConfigProvider<any>(zkConfigPath),
    proofProvider: httpClientProofProvider(envConfig.proofServer),
  };

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

  await walletProvider.stop().catch(() => {});
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Deployment error:', err);
  process.exit(1);
});
