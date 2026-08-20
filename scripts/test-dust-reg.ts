import { pino } from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightWalletProvider } from '../bboard-cli/src/midnight-wallet-provider.js';
import { getInitialUnshieldedState } from '../bboard-cli/src/wallet-utils.js';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { createKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { getUnshieldedSeed } from '../bboard-cli/src/generate-dust.js';
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

  logger.info('Initializing Midnight Preprod wallet...');
  const walletProvider = await MidnightWalletProvider.build(logger, envConfig, seed);
  await walletProvider.start();

  const token = unshieldedToken();
  const unshieldedState = await Rx.firstValueFrom(
    walletProvider.wallet.unshielded.state.pipe(
      Rx.filter((state) => (state.balances[token.raw] ?? 0n) > 0n),
      Rx.timeout({ each: 15000, with: () => Rx.firstValueFrom(walletProvider.wallet.unshielded.state) }),
    ),
  );

  const balance = unshieldedState.balances[token.raw] ?? 0n;
  logger.info(`Unshielded balance: ${balance}`);
  logger.info(`Available coins: ${JSON.stringify(unshieldedState.availableCoins)}`);

  const utxos = unshieldedState.availableCoins.filter((coin) => !coin.meta.registeredForDustGeneration);
  logger.info(`Unregistered UTXOs count: ${utxos.length}`);

  const dustAddress = await walletProvider.wallet.dust.getAddress();
  logger.info(`Dust address: ${JSON.stringify(dustAddress)}`);

  if (utxos.length > 0) {
    logger.info('Attempting registerNightUtxosForDustGeneration with dustAddress...');
    const unshieldedKeystore = createKeystore(getUnshieldedSeed(seed), 'preprod');
    const recipe = await walletProvider.wallet.registerNightUtxosForDustGeneration(
      utxos,
      unshieldedKeystore.getPublicKey() as any,
      (payload) => unshieldedKeystore.signData(payload),
      dustAddress,
    );
    logger.info(`Recipe created: ${JSON.stringify(recipe)}`);
    const transaction = await walletProvider.wallet.finalizeRecipe(recipe);
    logger.info('Finalized transaction');
    const txId = await walletProvider.wallet.submitTransaction(transaction);
    logger.info(`Submitted dust registration txId: ${txId}`);
  } else {
    logger.info('No unregistered UTXOs to register.');
  }

  await walletProvider.stop().catch(() => {});
  process.exit(0);
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
