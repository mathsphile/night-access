/*
 * This file is part of example-bboard.
 * Copyright (C) Midnight Foundation
 * SPDX-License-Identifier: Apache-2.0
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  type CoinPublicKey,
  DustSecretKey,
  type EncPublicKey,
  type FinalizedTransaction,
  LedgerParameters,
  ZswapSecretKeys,
  DustLocalState,
  DustStateMerkleTreeCollapsedUpdate,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { type MidnightProvider, type UnboundTransaction, type WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { ttlOneHour } from '@midnight-ntwrk/midnight-js-utils';
import {
  type WalletFacade,
  WalletFacade as WalletFacadeImpl,
  WalletEntrySchema,
  mergeWalletEntries,
} from '@midnight-ntwrk/wallet-sdk-facade';
import { InMemoryTransactionHistoryStorage, SerializedTransaction } from '@midnight-ntwrk/wallet-sdk-abstractions';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { UnshieldedWallet, PublicKey, createKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { SubmissionEvent } from '@midnight-ntwrk/wallet-sdk-node-client/effect';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';
import axios from 'axios';
import type { Logger } from 'pino';

import { getInitialShieldedState } from './wallet-utils.js';
import { type DustWalletOptions, type EnvironmentConfiguration, FluentWalletBuilder } from '@midnight-ntwrk/testkit-js';

type UnshieldedKeystore = {
  getPublicKey(): unknown;
  signData(payload: Uint8Array): string;
};

const deriveKeyForRole = (seed: string, role: any) => {
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

/**
 * Provider class that implements wallet functionality for the Midnight network.
 * Handles transaction balancing, submission, and wallet state management.
 */
export class MidnightWalletProvider implements MidnightProvider, WalletProvider {
  logger: Logger;
  readonly env: EnvironmentConfiguration;
  readonly wallet: WalletFacade;
  readonly unshieldedKeystore: UnshieldedKeystore;
  readonly zswapSecretKeys: ZswapSecretKeys;
  readonly dustSecretKey: DustSecretKey;
  private readonly polkadotApi?: ApiPromise;

  private constructor(
    logger: Logger,
    environmentConfiguration: EnvironmentConfiguration,
    wallet: WalletFacade,
    zswapSecretKeys: ZswapSecretKeys,
    dustSecretKey: DustSecretKey,
    unshieldedKeystore: UnshieldedKeystore,
    polkadotApi?: ApiPromise,
  ) {
    this.logger = logger;
    this.env = environmentConfiguration;
    this.wallet = wallet;
    this.zswapSecretKeys = zswapSecretKeys;
    this.dustSecretKey = dustSecretKey;
    this.unshieldedKeystore = unshieldedKeystore;
    this.polkadotApi = polkadotApi;
  }

  getCoinPublicKey(): CoinPublicKey {
    return this.zswapSecretKeys.coinPublicKey;
  }

  getEncryptionPublicKey(): EncPublicKey {
    return this.zswapSecretKeys.encryptionPublicKey;
  }

  async balanceTx(tx: UnboundTransaction, ttl: Date = ttlOneHour()): Promise<FinalizedTransaction> {
    const recipe = await this.wallet.balanceUnboundTransaction(
      tx,
      { shieldedSecretKeys: this.zswapSecretKeys, dustSecretKey: this.dustSecretKey },
      { ttl },
    );
    const signedRecipe = await this.wallet.signRecipe(recipe, (payload) => this.unshieldedKeystore.signData(payload));
    return this.wallet.finalizeRecipe(signedRecipe);
  }

  submitTx(tx: FinalizedTransaction): Promise<string> {
    return this.wallet.submitTransaction(tx);
  }

  async start(): Promise<void> {
    this.logger.info('Starting wallet...');
    await this.wallet.start(this.zswapSecretKeys, this.dustSecretKey);
  }

  async stop(): Promise<void> {
    if (this.polkadotApi) {
      await this.polkadotApi.disconnect().catch(() => {});
    }
    return this.wallet.stop();
  }

  static async build(logger: Logger, env: EnvironmentConfiguration, seed?: string): Promise<MidnightWalletProvider> {
    const masterSeed = seed ?? '4c89a01f92e4785b8c310248ad912efc4710924b1728e9a0342981f9b027ca81';

    if (env.networkId === 'preprod') {
      try {
        logger.info('Configuring optimized Midnight Preprod wallet with fast Merkle tree sync...');
        const shieldedSeed = deriveKeyForRole(masterSeed, Roles.Zswap);
        const unshieldedSeed = deriveKeyForRole(masterSeed, Roles.NightExternal);
        const dustSeed = deriveKeyForRole(masterSeed, Roles.Dust);
        const dustSecretKey = DustSecretKey.fromSeed(dustSeed);
        const zswapSecretKeys = ZswapSecretKeys.fromSeed(shieldedSeed);
        const unshieldedKeystore = createKeystore(unshieldedSeed, 'preprod');

        // Fetch collapsed Merkle tree updates for dust state from GraphQL
        const query = `
          query GetCollapsedUpdates {
            dustGenerationMerkleTreeUpdate(startIndex: 0, endIndex: 373979) {
              update
            }
            dustCommitmentMerkleTreeUpdate(startIndex: 0, endIndex: 1071502) {
              update
            }
          }
        `;

        const resp = await axios.post(env.indexer, { query }, { timeout: 15000 });
        const genUpdateHex = resp.data?.data?.dustGenerationMerkleTreeUpdate?.update;
        const commitUpdateHex = resp.data?.data?.dustCommitmentMerkleTreeUpdate?.update;

        const dustParameters = LedgerParameters.initialParameters().dust;
        let localState = new DustLocalState(dustParameters);
        if (genUpdateHex) {
          localState = localState.applyGenerationCollapsedUpdate(
            DustStateMerkleTreeCollapsedUpdate.deserialize(Buffer.from(genUpdateHex, 'hex')),
          );
        }
        if (commitUpdateHex) {
          localState = localState.applyCommitmentCollapsedUpdate(
            DustStateMerkleTreeCollapsedUpdate.deserialize(Buffer.from(commitUpdateHex, 'hex')),
          );
        }

        const snapshot = {
          publicKey: { publicKey: dustSecretKey.publicKey.toString() },
          state: Buffer.from(localState.serialize()).toString('hex'),
          protocolVersion: '1',
          networkId: 'preprod',
          offset: '1445000',
        };

        const polkadotWs = new WsProvider(env.nodeWS || 'wss://rpc.preprod.midnight.network');
        const polkadotApi = await ApiPromise.create({ provider: polkadotWs, noInitWarn: true });

        const config = {
          indexerClientConnection: {
            indexerHttpUrl: env.indexer,
            indexerWsUrl: env.indexerWS,
          },
          provingServerUrl: new URL(env.proofServer),
          networkId: 'preprod',
          relayURL: new URL(env.nodeWS || 'wss://rpc.preprod.midnight.network'),
          txHistoryStorage: new InMemoryTransactionHistoryStorage(WalletEntrySchema, mergeWalletEntries),
          costParameters: {
            ledgerParams: LedgerParameters.initialParameters(),
            additionalFeeOverhead: 1000n,
            feeBlocksMargin: 5,
          },
          batchUpdates: {
            size: 500,
            spacing: 0,
            timeout: 10,
          },
        };

        const shieldedWallet = ShieldedWallet(config as any).startWithSeed(shieldedSeed);
        const unshieldedWallet = UnshieldedWallet(config as any).startWithPublicKey(
          PublicKey.fromKeyStore(unshieldedKeystore),
        );
        const dustWallet = DustWallet(config as any).restore(JSON.stringify(snapshot));

        const customSubmissionService = {
          submitTransaction: async (transaction: any, waitForStatus?: 'Submitted' | 'InBlock' | 'Finalized') => {
            const serialized = SerializedTransaction.from(transaction);
            const hex = u8aToHex(serialized);
            return new Promise<any>((resolve, reject) => {
              polkadotApi.tx.midnight.sendMnTransaction(hex).send((result) => {
                if (result.status.isInBlock) {
                  logger.info(`Tx included in block: ${result.status.asInBlock.toHex()}`);
                  const inBlockEvent = SubmissionEvent.InBlock({
                    tx: serialized,
                    blockHash: result.status.asInBlock.toString(),
                    blockHeight: 0n,
                    txHash: result.txHash.toString(),
                  });
                  if (!waitForStatus || waitForStatus === 'InBlock') {
                    resolve(inBlockEvent);
                  }
                }
                if (result.status.isFinalized) {
                  logger.info(`Tx finalized: ${result.status.asFinalized.toHex()}`);
                  resolve(
                    SubmissionEvent.Finalized({
                      tx: serialized,
                      blockHash: result.status.asFinalized.toString(),
                      blockHeight: 0n,
                      txHash: result.txHash.toString(),
                    }),
                  );
                }
              }).catch(reject);
            });
          },
          close: async () => {
            await polkadotApi.disconnect();
          },
        };

        const walletFacade = await WalletFacadeImpl.init({
          configuration: config as any,
          shielded: () => shieldedWallet,
          unshielded: () => unshieldedWallet,
          dust: () => dustWallet,
          submissionService: () => customSubmissionService,
        });

        const initialState = await getInitialShieldedState(logger, walletFacade.shielded);
        logger.info(
          `Your wallet seed is: ${masterSeed} and your address is: ${initialState.address.coinPublicKeyString()}`,
        );

        return new MidnightWalletProvider(
          logger,
          env,
          walletFacade,
          zswapSecretKeys,
          dustSecretKey,
          unshieldedKeystore,
          polkadotApi,
        );
      } catch (err: any) {
        logger.warn(`Fast sync initialization fallback: ${err?.message || err}. Falling back to default builder.`);
      }
    }

    // Default builder fallback
    const dustOptions: DustWalletOptions = {
      ledgerParams: LedgerParameters.initialParameters(),
      additionalFeeOverhead: env.walletNetworkId === 'undeployed' ? 500_000_000_000_000_000n : 1_000n,
      feeBlocksMargin: 5,
    };
    const builder = FluentWalletBuilder.forEnvironment(env).withDustOptions(dustOptions);
    const buildResult = seed
      ? await builder.withSeed(seed).buildWithoutStarting()
      : await builder.withRandomSeed().buildWithoutStarting();
    const { wallet, seeds, keystore } = buildResult as unknown as {
      wallet: WalletFacade;
      seeds: { masterSeed: string; shielded: Uint8Array; dust: Uint8Array };
      keystore: UnshieldedKeystore;
    };

    const initialState = await getInitialShieldedState(logger, wallet.shielded);
    logger.info(
      `Your wallet seed is: ${seeds.masterSeed} and your address is: ${initialState.address.coinPublicKeyString()}`,
    );

    return new MidnightWalletProvider(
      logger,
      env,
      wallet,
      ZswapSecretKeys.fromSeed(seeds.shielded),
      DustSecretKey.fromSeed(seeds.dust),
      keystore,
    );
  }
}
