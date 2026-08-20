import axios from 'axios';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';

export async function checkUnshieldedBalance(unshieldedAddressStr: string): Promise<bigint> {
  const indexerUrl = 'https://indexer.preprod.midnight.network/api/v4/graphql';
  
  // Query unshielded UTXOs / balance from GraphQL indexer
  const query = `
    query GetUnshieldedBalance($address: String!) {
      unshieldedUtxos(where: { address: { _eq: $address } }) {
        value
        tokenType
      }
    }
  `;

  try {
    const res = await axios.post(indexerUrl, {
      query,
      variables: { address: unshieldedAddressStr },
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    const utxos = res.data?.data?.unshieldedUtxos || [];
    let total = 0n;
    for (const utxo of utxos) {
      if (utxo.value) {
        total += BigInt(utxo.value);
      }
    }
    return total;
  } catch (err) {
    // If indexer query differs or fails, return 0n
    return 0n;
  }
}
