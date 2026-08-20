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
  await walletProvider.start();

  let count = 0;
  const sub = walletProvider.wallet.state().subscribe((state) => {
    count++;
    if (count % 20 === 0 || state.dust.balance(new Date()) > 0n) {
      const dBalance = state.dust.balance(new Date());
      const progress = state.dust.progress;
      const totalCoins = state.dust.totalCoins;
      const availCoins = state.dust.availableCoins;
      logger.info(`[Sync Update #${count}] Dust Bal: ${dBalance}, Total Dust Coins: ${totalCoins.length}, Avail Dust Coins: ${availCoins.length}, Progress: ${JSON.stringify(progress)}`);
    }
  });

  // Run for up to 30 seconds
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const cur = await Rx.firstValueFrom(walletProvider.wallet.state());
    if (cur.dust.balance(new Date()) > 0n) {
      logger.info(`✨ Found non-zero dust balance: ${cur.dust.balance(new Date())}`);
      break;
    }
  }

  sub.unsubscribe();
  await walletProvider.stop().catch(() => {});
}

main().catch(console.error);
