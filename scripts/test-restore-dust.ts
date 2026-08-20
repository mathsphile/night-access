import { pino } from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { LedgerParameters, DustSecretKey } from '@midnight-ntwrk/ledger-v8';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { WalletEntrySchema, mergeWalletEntries, WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { InMemoryTransactionHistoryStorage } from '@midnight-ntwrk/wallet-sdk-abstractions';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { UnshieldedWallet, PublicKey, createKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as ledger from '@midnight-ntwrk/ledger-v8';
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

const deriveKeyForRole = (seed: string, role: number) => {
  const seedBuffer = Buffer.from(seed, 'hex');
  const hdWalletResult = HDWallet.fromSeed(seedBuffer);
  if (hdWalletResult.type !== 'seedOk') {
    throw new Error('Invalid seed: failed to create HD wallet');
  }
  const result = hdWalletResult.hdWallet.selectAccount(0).selectRole(role).deriveKeyAt(0);
  if (result.type === 'keyOutOfBounds') {
    throw new Error('Key out of bounds');
  }
  return result.key;
};

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

  const shieldedSeed = deriveKeyForRole(seed, Roles.Zswap);
  const unshieldedSeed = deriveKeyForRole(seed, Roles.NightExternal);
  const dustSeed = deriveKeyForRole(seed, Roles.Dust);
  const dustSecretKey = DustSecretKey.fromSeed(dustSeed);
  const dustPublicKey = dustSecretKey.publicKey;

  const envConfig = {
    indexerClientConnection: {
      indexerHttpUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
      indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    },
    provingServerUrl: new URL(process.env.PROOF_SERVER_URL || 'http://localhost:6300'),
    networkId: 'preprod',
    relayURL: new URL('wss://rpc.preprod.midnight.network'),
    txHistoryStorage: new InMemoryTransactionHistoryStorage(WalletEntrySchema, mergeWalletEntries),
    costParameters: {
      ledgerParams: LedgerParameters.initialParameters(),
      additionalFeeOverhead: 1000n,
      feeBlocksMargin: 5,
    },
  };

  const dustParameters = LedgerParameters.initialParameters().dust;
  const initialLocalState = new ledger.DustLocalState(dustParameters);

  // Offset ~1445000 (before our registration tx)
  const snapshot = {
    publicKey: { publicKey: dustSecretKey.publicKey.toString() },
    state: Buffer.from(initialLocalState.serialize()).toString('hex'),
    protocolVersion: '1',
    networkId: 'preprod',
    offset: '1445000',
  };

  logger.info('Restoring DustWallet with offset 1445000...');
  const dustWalletClass = DustWallet(envConfig as any);
  const dustWallet = dustWalletClass.restore(JSON.stringify(snapshot));

  const unshieldedKeystore = createKeystore(unshieldedSeed, 'preprod');
  const unshieldedWallet = UnshieldedWallet({
    ...envConfig,
    txHistoryStorage: new InMemoryTransactionHistoryStorage(WalletEntrySchema, mergeWalletEntries),
  }).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));

  const shieldedWallet = ShieldedWallet(envConfig as any).startWithSeed(shieldedSeed);

  logger.info('Initializing WalletFacade...');
  const walletFacade = await WalletFacade.init({
    configuration: envConfig as any,
    shielded: () => shieldedWallet,
    unshielded: () => unshieldedWallet,
    dust: () => dustWallet,
  });

  logger.info('Starting wallet facade...');
  await walletFacade.start(ledger.ZswapSecretKeys.fromSeed(shieldedSeed), dustSecretKey);

  logger.info('Observing DustWallet state stream...');
  const sub = walletFacade.state().subscribe((state) => {
    const progress = state.dust.progress;
    const balance = state.dust.balance(new Date());
    const totalCoins = state.dust.totalCoins;
    const availCoins = state.dust.availableCoins;
    logger.info(`Dust progress: ${progress.appliedIndex} / ${progress.highestRelevantWalletIndex} (Dust balance: ${balance}, total coins: ${totalCoins.length}, avail coins: ${availCoins.length})`);
  });

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const cur = await Rx.firstValueFrom(walletFacade.state());
    if (cur.dust.balance(new Date()) > 0n) {
      logger.info(`🎉 SUCCESS! Dust balance is now: ${cur.dust.balance(new Date())}`);
      break;
    }
  }

  sub.unsubscribe();
  await walletFacade.stop().catch(() => {});
}

main().catch(console.error);
