import { pino } from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightWalletProvider } from '../bboard-cli/src/midnight-wallet-provider.js';
import { getInitialUnshieldedState } from '../bboard-cli/src/wallet-utils.js';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import * as Rx from 'rxjs';
import fs from 'fs';
import path from 'path';

setNetworkId('preprod');

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
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

  logger.info('Starting wallet to monitor dust...');
  const walletProvider = await MidnightWalletProvider.build(logger, envConfig, seed);
  await walletProvider.start();

  const sub = walletProvider.wallet.state().subscribe((state) => {
    const dBalance = state.dust.balance(new Date());
    const unshieldedBal = state.unshielded.balances[unshieldedToken().raw];
    const registeredCoins = state.unshielded.availableCoins.filter((c) => c.meta.registeredForDustGeneration);
    const unregisteredCoins = state.unshielded.availableCoins.filter((c) => !c.meta.registeredForDustGeneration);
    logger.info(`State Update -> Unshielded: ${unshieldedBal}, Dust: ${dBalance}, Registered UTXOs: ${registeredCoins.length}, Unregistered UTXOs: ${unregisteredCoins.length}`);
  });

  // Wait 15 seconds
  await new Promise((r) => setTimeout(r, 15000));
  sub.unsubscribe();
  await walletProvider.stop().catch(() => {});
}

main().catch(console.error);
