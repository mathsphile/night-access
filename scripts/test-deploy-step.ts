import { pino } from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightWalletProvider } from '../bboard-cli/src/midnight-wallet-provider.js';
import { getInitialUnshieldedState } from '../bboard-cli/src/wallet-utils.js';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { BBoardAPI } from '../api/src/index.js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import * as Rx from 'rxjs';
import path from 'path';

setNetworkId('preprod');

const logger = pino({
  level: 'trace',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

async function main() {
  const seed = '4c89a01f92e4785b8c310248ad912efc4710924b1728e9a0342981f9b027ca81';
  const envConfig: EnvironmentConfiguration = {
    walletNetworkId: 'preprod',
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    nodeWS: 'wss://rpc.preprod.midnight.network',
    faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
    proofServer: 'http://localhost:6300',
  };

  logger.info('Building wallet provider...');
  const walletProvider = await MidnightWalletProvider.build(logger, envConfig, seed);
  await walletProvider.start();

  const initialState = await getInitialUnshieldedState(logger, walletProvider.wallet.unshielded);
  const unshieldedAddress = UnshieldedAddress.codec.encode('preprod', initialState.address);
  logger.info(`Address: ${unshieldedAddress.toString()}`);

  logger.info('Waiting for DUST balance...');
  await Rx.firstValueFrom(
    walletProvider.wallet.state().pipe(
      Rx.filter((state) => state.dust.balance(new Date()) > 0n),
      Rx.timeout({ each: 30000 }),
    ),
  );
  logger.info('Dust balance confirmed!');

  const zkConfigPath = path.resolve(process.cwd(), 'contract', 'src', 'managed', 'bboard');
  const zkConfigProvider = new NodeZkConfigProvider<any>(zkConfigPath);
  const proofProvider = httpClientProofProvider(envConfig.proofServer, zkConfigProvider);

  const providers = {
    midnightProvider: walletProvider,
    walletProvider: walletProvider,
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'vvp-test-state',
      accountId: unshieldedAddress.toString(),
      privateStoragePasswordProvider: () => Promise.resolve('visitor-verification-platform-secure-key-12345'),
    }),
    publicDataProvider: indexerPublicDataProvider(envConfig.indexer, envConfig.indexerWS),
    zkConfigProvider: zkConfigProvider,
    proofProvider: proofProvider,
  };

  try {
    logger.info('Calling BBoardAPI.deploy...');
    const api = await BBoardAPI.deploy(providers, logger);
    logger.info(`Successfully deployed at: ${api.deployedContractAddress}`);
  } catch (err: any) {
    logger.error({ err }, 'Error during BBoardAPI.deploy');
    if (err.cause) {
      logger.error({ cause: err.cause }, 'Underlying cause');
    }
  } finally {
    await walletProvider.stop().catch(() => {});
  }
}

main().catch(console.error);
