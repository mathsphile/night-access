import { pino } from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightWalletProvider } from '../bboard-cli/src/midnight-wallet-provider.js';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
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

  const envConfig: EnvironmentConfiguration & { batchUpdates?: any } = {
    walletNetworkId: 'preprod',
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    nodeWS: 'wss://rpc.preprod.midnight.network',
    faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
    proofServer: process.env.PROOF_SERVER_URL || 'http://localhost:6300',
    batchUpdates: {
      size: 5000,
      spacing: 0,
      timeout: 10,
    },
  };

  const startTime = Date.now();
  logger.info('Building wallet with batchUpdates size 5000...');
  const walletProvider = await MidnightWalletProvider.build(logger, envConfig as any, seed);
  await walletProvider.start();

  logger.info('Waiting for dust balance or sync...');
  const sub = walletProvider.wallet.state().subscribe((state) => {
    const progress = state.dust.progress;
    const balance = state.dust.balance(new Date());
    logger.info(`Dust progress: ${progress.appliedIndex} / ${progress.highestRelevantWalletIndex} (Dust balance: ${balance})`);
  });

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const cur = await Rx.firstValueFrom(walletProvider.wallet.state());
    if (cur.dust.balance(new Date()) > 0n || cur.dust.progress.isStrictlyComplete()) {
      logger.info(`✨ Done! Dust balance: ${cur.dust.balance(new Date())}, Time: ${(Date.now() - startTime) / 1000}s`);
      break;
    }
  }

  sub.unsubscribe();
  await walletProvider.stop().catch(() => {});
}

main().catch(console.error);
