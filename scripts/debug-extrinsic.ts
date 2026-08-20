import { ApiPromise, WsProvider } from '@polkadot/api';
import { pino } from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightWalletProvider } from '../bboard-cli/src/midnight-wallet-provider.js';
import { getInitialUnshieldedState } from '../bboard-cli/src/wallet-utils.js';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { createKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { getUnshieldedSeed } from '../bboard-cli/src/generate-dust.js';
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

  const token = unshieldedToken();
  const unshieldedState = await Rx.firstValueFrom(
    walletProvider.wallet.unshielded.state.pipe(
      Rx.filter((state) => (state.balances[token.raw] ?? 0n) > 0n),
    ),
  );

  const utxos = unshieldedState.availableCoins.filter((coin) => !coin.meta.registeredForDustGeneration);
  logger.info(`Found ${utxos.length} unregistered UTXOs`);

  const dustAddress = await walletProvider.wallet.dust.getAddress();
  const unshieldedKeystore = createKeystore(getUnshieldedSeed(seed), 'preprod');

  const recipe = await walletProvider.wallet.registerNightUtxosForDustGeneration(
    utxos,
    unshieldedKeystore.getPublicKey() as any,
    (payload) => unshieldedKeystore.signData(payload),
    dustAddress,
  );
  const transaction = await walletProvider.wallet.finalizeRecipe(recipe);
  const serialized = transaction.serialize();
  const txHex = u8aToHex(serialized);
  logger.info(`Serialized tx hex length: ${txHex.length}`);

  // Connect polkadot API directly to investigate
  const wsProvider = new WsProvider('wss://rpc.preprod.midnight.network');
  const api = await ApiPromise.create({ provider: wsProvider, noInitWarn: true });
  logger.info('Connected to Polkadot RPC on preprod');

  try {
    const tx = api.tx.midnight.sendMnTransaction(txHex);
    logger.info(`Extrinsic hash: ${tx.hash.toHex()}`);

    // Try payment info / dry run
    logger.info('Submitting extrinsic...');
    const unsub = await tx.send((result) => {
      logger.info(`Extrinsic status: ${result.status.type}`);
      if (result.status.isInBlock) {
        logger.info(`Included in block: ${result.status.asInBlock.toHex()}`);
      }
      if (result.status.isFinalized) {
        logger.info(`Finalized in block: ${result.status.asFinalized.toHex()}`);
        unsub();
      }
      if (result.dispatchError) {
        if (result.dispatchError.isModule) {
          const decoded = api.registry.findMetaError(result.dispatchError.asModule);
          logger.error(`Dispatch error: ${decoded.section}.${decoded.name}: ${decoded.docs.join(' ')}`);
        } else {
          logger.error(`Dispatch error: ${result.dispatchError.toString()}`);
        }
      }
    });

    // Wait 20 seconds
    await new Promise((r) => setTimeout(r, 20000));
  } catch (err: any) {
    logger.error(`Submission caught error: ${err?.message || err}`);
  } finally {
    await api.disconnect();
    await walletProvider.stop().catch(() => {});
  }
}

main().catch(console.error);
