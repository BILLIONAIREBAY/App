import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  SHADOW_VAULT: R2Bucket;
  AUCTION_ROOM: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

app.get('/', (c) => {
  return c.json({
    name: 'BillionaireBay Luminescence API',
    version: '3.0.0',
    architecture: {
      edge: 'Cloudflare Workers',
      storage: 'R2 Shadow Vault',
      realtime: 'Durable Objects',
      blockchain: 'Base Sepolia (FxChain Ready)',
    },
    status: 'operational',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default app;

export { AuctionRoomDO } from './durable-objects/AuctionRoom';
