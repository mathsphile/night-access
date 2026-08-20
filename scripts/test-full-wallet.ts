import { pino } from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { LedgerParameters, DustSecretKey, ZswapSecretKeys } from '@midnight-ntwrk/ledger-v8';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { WalletEntrySchema, mergeWalletEntries, WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { InMemoryTransactionHistoryStorage, SerializedTransaction } from '@midnight-ntwrk/wallet-sdk-abstractions';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { UnshieldedWallet, PublicKey, createKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { SubmissionEvent } from '@midnight-ntwrk/wallet-sdk-node-client/effect';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';
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
    throw new Error('Invalid seed');
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
  const zswapSecretKeys = ZswapSecretKeys.fromSeed(shieldedSeed);
  const unshieldedKeystore = createKeystore(unshieldedSeed, 'preprod');

  const polkadotWs = new WsProvider('wss://rpc.preprod.midnight.network');
  const polkadotApi = await ApiPromise.create({ provider: polkadotWs, noInitWarn: true });
  logger.info('Connected persistent Polkadot RPC client');

  const config = {
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
    batchUpdates: {
      size: 5000,
      spacing: 0,
      timeout: 10,
    },
  };

  const shieldedWallet = ShieldedWallet(config as any).startWithSeed(shieldedSeed);
  const unshieldedWallet = UnshieldedWallet(config as any).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
  const dustWallet = DustWallet(config as any).startWithSeed(dustSeed, LedgerParameters.initialParameters().dust);

  const customSubmissionService = {
    submitTransaction: async (transaction: any) => {
      const serialized = SerializedTransaction.from(transaction);
      const hex = u8aToHex(serialized);
      return new Promise<any>((resolve, reject) => {
        polkadotApi.tx.midnight.sendMnTransaction(hex).send((result) => {
          if (result.status.isInBlock) {
            logger.info(`Tx included in block: ${result.status.asInBlock.toHex()}`);
            resolve(
              SubmissionEvent.InBlock({
                tx: serialized,
                blockHash: result.status.asInBlock.toString(),
                blockHeight: 0n,
                txHash: result.txHash.toString(),
              }),
            );
          }
          if (result.status.isFinalized) {
            logger.info(`Tx finalized: ${result.status.asFinalized.toHex()}`);
          }
          if (result.dispatchError) {
            reject(new Error(`Extrinsic dispatch error: ${result.dispatchError.toString()}`));
          }
        }).catch(reject);
      });
    },
    close: async () => {
      await polkadotApi.disconnect();
    },
  };

  logger.info('Initializing WalletFacade with fast batchUpdates and reliable Polkadot submission...');
  const walletFacade = await WalletFacade.init({
    configuration: config as any,
    shielded: () => shieldedWallet,
    unshielded: () => unshieldedWallet,
    dust: () => dustWallet,
    submissionService: () => customSubmissionService,
  });

  const startTime = Date.now();
  await walletFacade.start(zswapSecretKeys, dustSecretKey);

  logger.info('Waiting for dust sync...');
  let lastReport = 0;
  const sub = walletFacade.state().subscribe((state) => {
    const dBal = state.dust.balance(new Date());
    const progress = state.dust.progress;
    if (Date.now() - lastReport > 2000 || dBal > 0n) {
      lastReport = Date.now();
      logger.info(`Dust progress: ${progress.appliedIndex} / ${progress.highestRelevantWalletIndex} (Dust balance: ${dBal}) [${((Date.now() - startTime) / 1000).toFixed(1)}s]`);
    }
  });

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const cur = await Rx.firstValueFrom(walletFacade.state());
    if (cur.dust.balance(new Date()) > 0n) {
      logger.info(`🎉 Dust balance available: ${cur.dust.balance(new Date())}! Sync took ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
      break;
    }
  }

  sub.unsubscribe();
  await walletFacade.stop().catch(() => {});
  await customSubmissionService.close().catch(() => {});
}

main().catch(console.error);
