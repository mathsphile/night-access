import { createClient } from 'graphql-ws';
import { WebSocket } from 'ws';
import { Event as LedgerEvent } from '@midnight-ntwrk/ledger-v8';

const client = createClient({
  url: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  webSocketImpl: WebSocket,
});

async function main() {
  const query = `
    subscription DustEvents($id: Int) {
      dustLedgerEvents(id: $id) {
        id
        raw
        maxId
      }
    }
  `;

  let count = 0;
  const unsubscribe = client.subscribe(
    { query, variables: { id: 1445000 } },
    {
      next: (data: any) => {
        count++;
        const eventData = data?.data?.dustLedgerEvents;
        if (eventData && count <= 5) {
          const raw = Buffer.from(eventData.raw, 'hex');
          try {
            const event = LedgerEvent.deserialize(raw);
            console.log(`Event ID ${eventData.id}: content tag =`, event.content.tag, JSON.stringify(event.content, (k, v) => typeof v === 'bigint' ? v.toString() : v));
          } catch (e: any) {
            console.log(`Event ID ${eventData.id}: error ${e.message}`);
          }
        }
        if (count >= 5) {
          unsubscribe();
          client.dispose();
          process.exit(0);
        }
      },
      error: console.error,
      complete: () => {},
    },
  );
}

main().catch(console.error);
