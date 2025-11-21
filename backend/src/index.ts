import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';
import { z } from 'zod';

type Bindings = {
  SHADOW_VAULT: R2Bucket;
  AUCTION_ROOM: DurableObjectNamespace;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  AURA_REGISTRY_ADDRESS: string;
  BASE_SEPOLIA_RPC: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

const SyncPushSchema = z.object({
  created: z.object({
    users: z.array(z.any()).optional(),
    items: z.array(z.any()).optional(),
    charities: z.array(z.any()).optional(),
  }).optional(),
  updated: z.object({
    users: z.array(z.any()).optional(),
    items: z.array(z.any()).optional(),
    charities: z.array(z.any()).optional(),
  }).optional(),
  deleted: z.object({
    users: z.array(z.string()).optional(),
    items: z.array(z.string()).optional(),
    charities: z.array(z.string()).optional(),
  }).optional(),
});

const AURA_REGISTRY_ABI = parseAbi([
  'function isStolen(bytes32) view returns (bool)',
  'function checkItemStatus(bytes32) view returns (bool stolen, uint256 reportTime, string reason)',
]);

app.get('/', (c) => {
  return c.json({
    name: 'BillionaireBay Luminescence API',
    version: '3.0.0',
    architecture: {
      edge: 'Cloudflare Workers',
      storage: 'R2 Shadow Vault',
      realtime: 'Durable Objects',
      blockchain: 'Base Sepolia (FxChain Ready)',
      guardian: 'AuraRegistry Smart Trap',
    },
    status: 'operational',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/sync/push', async (c) => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AURA_REGISTRY_ADDRESS, BASE_SEPOLIA_RPC } = c.env;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return c.json({ error: 'Supabase configuration missing' }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await c.req.json();
    const payload = SyncPushSchema.parse(body);

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC || 'https://sepolia.base.org'),
    });

    console.log('[SYNC/PUSH] Processing changes:', {
      created: {
        users: payload.created?.users?.length || 0,
        items: payload.created?.items?.length || 0,
        charities: payload.created?.charities?.length || 0,
      },
      updated: {
        users: payload.updated?.users?.length || 0,
        items: payload.updated?.items?.length || 0,
        charities: payload.updated?.charities?.length || 0,
      },
      deleted: {
        users: payload.deleted?.users?.length || 0,
        items: payload.deleted?.items?.length || 0,
        charities: payload.deleted?.charities?.length || 0,
      },
    });

    if (payload.created) {
      for (const item of payload.created.items || []) {
        if (item.serial_number_hash) {
          console.log('[SMART TRAP] Checking item:', item.id, 'Serial Hash:', item.serial_number_hash);

          try {
            const isItemStolen = await publicClient.readContract({
              address: AURA_REGISTRY_ADDRESS as `0x${string}`,
              abi: AURA_REGISTRY_ABI,
              functionName: 'isStolen',
              args: [item.serial_number_hash as `0x${string}`],
            });

            if (isItemStolen) {
              console.error('[SMART TRAP] BLOCKED - Stolen asset detected:', item.serial_number_hash);
              return c.json(
                {
                  error: 'STOLEN_ASSET_DETECTED',
                  message: 'This item has been flagged as stolen in the Aura Registry',
                  serialHash: item.serial_number_hash,
                  itemId: item.id,
                },
                403
              );
            }

            console.log('[SMART TRAP] ✓ Item clean - proceeding with insert');
          } catch (blockchainError) {
            console.error('[SMART TRAP] Blockchain check failed:', blockchainError);
            return c.json(
              {
                error: 'BLOCKCHAIN_CHECK_FAILED',
                message: 'Unable to verify item status on blockchain',
                details: blockchainError instanceof Error ? blockchainError.message : 'Unknown error',
              },
              503
            );
          }
        }

        const { created_at, updated_at, ...cleanItem } = item;
        const { error } = await supabase.from('items').insert(cleanItem);
        if (error) {
          console.error('[SYNC/PUSH] Item insert failed:', error);
          return c.json({ error: 'Database insert failed', table: 'items', details: error.message }, 500);
        }
      }

      for (const user of payload.created.users || []) {
        const { created_at, updated_at, ...cleanUser } = user;
        const { error } = await supabase.from('users').insert(cleanUser);
        if (error) {
          console.error('[SYNC/PUSH] User insert failed:', error);
          return c.json({ error: 'Database insert failed', table: 'users', details: error.message }, 500);
        }
      }

      for (const charity of payload.created.charities || []) {
        const { created_at, updated_at, ...cleanCharity } = charity;
        const { error } = await supabase.from('charities').insert(cleanCharity);
        if (error) {
          console.error('[SYNC/PUSH] Charity insert failed:', error);
          return c.json({ error: 'Database insert failed', table: 'charities', details: error.message }, 500);
        }
      }
    }

    if (payload.updated) {
      for (const item of payload.updated.items || []) {
        const { id, created_at, updated_at, ...data } = item;
        const { error } = await supabase.from('items').update(data).eq('id', id);
        if (error) {
          console.error('[SYNC/PUSH] Item update failed:', error);
          return c.json({ error: 'Database update failed', table: 'items', details: error.message }, 500);
        }
      }

      for (const user of payload.updated.users || []) {
        const { id, created_at, updated_at, ...data } = user;
        const { error } = await supabase.from('users').update(data).eq('id', id);
        if (error) {
          console.error('[SYNC/PUSH] User update failed:', error);
          return c.json({ error: 'Database update failed', table: 'users', details: error.message }, 500);
        }
      }

      for (const charity of payload.updated.charities || []) {
        const { id, created_at, updated_at, ...data } = charity;
        const { error } = await supabase.from('charities').update(data).eq('id', id);
        if (error) {
          console.error('[SYNC/PUSH] Charity update failed:', error);
          return c.json({ error: 'Database update failed', table: 'charities', details: error.message }, 500);
        }
      }
    }

    if (payload.deleted) {
      for (const userId of payload.deleted.users || []) {
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) {
          console.error('[SYNC/PUSH] User delete failed:', error);
          return c.json({ error: 'Database delete failed', table: 'users', details: error.message }, 500);
        }
      }

      for (const itemId of payload.deleted.items || []) {
        const { error } = await supabase.from('items').delete().eq('id', itemId);
        if (error) {
          console.error('[SYNC/PUSH] Item delete failed:', error);
          return c.json({ error: 'Database delete failed', table: 'items', details: error.message }, 500);
        }
      }

      for (const charityId of payload.deleted.charities || []) {
        const { error } = await supabase.from('charities').delete().eq('id', charityId);
        if (error) {
          console.error('[SYNC/PUSH] Charity delete failed:', error);
          return c.json({ error: 'Database delete failed', table: 'charities', details: error.message }, 500);
        }
      }
    }

    console.log('[SYNC/PUSH] ✓ All changes synchronized successfully');
    return c.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[SYNC/PUSH] Fatal error:', error);
    return c.json(
      {
        error: 'SYNC_PUSH_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

app.get('/sync/pull', async (c) => {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = c.env;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return c.json({ error: 'Supabase configuration missing' }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const lastPulledAt = c.req.query('lastPulledAt');

    console.log('[SYNC/PULL] Fetching changes since:', lastPulledAt || 'beginning');

    let usersQuery = supabase.from('users').select('*');
    let itemsQuery = supabase.from('items').select('*');
    let charitiesQuery = supabase.from('charities').select('*');

    if (lastPulledAt) {
      const timestamp = new Date(lastPulledAt).toISOString();
      usersQuery = usersQuery.gt('updated_at', timestamp);
      itemsQuery = itemsQuery.gt('updated_at', timestamp);
      charitiesQuery = charitiesQuery.gt('updated_at', timestamp);
    }

    let deletionsQuery = supabase.from('deletions').select('*');
    if (lastPulledAt) {
      const timestamp = new Date(lastPulledAt).toISOString();
      deletionsQuery = deletionsQuery.gt('deleted_at', timestamp);
    }

    const [usersResult, itemsResult, charitiesResult, deletionsResult] = await Promise.all([
      usersQuery,
      itemsQuery,
      charitiesQuery,
      deletionsQuery,
    ]);

    if (usersResult.error) {
      console.error('[SYNC/PULL] Users fetch failed:', usersResult.error);
      return c.json({ error: 'Failed to fetch users', details: usersResult.error.message }, 500);
    }

    if (itemsResult.error) {
      console.error('[SYNC/PULL] Items fetch failed:', itemsResult.error);
      return c.json({ error: 'Failed to fetch items', details: itemsResult.error.message }, 500);
    }

    if (charitiesResult.error) {
      console.error('[SYNC/PULL] Charities fetch failed:', charitiesResult.error);
      return c.json({ error: 'Failed to fetch charities', details: charitiesResult.error.message }, 500);
    }

    if (deletionsResult.error) {
      console.error('[SYNC/PULL] Deletions fetch failed:', deletionsResult.error);
      return c.json({ error: 'Failed to fetch deletions', details: deletionsResult.error.message }, 500);
    }

    const users = usersResult.data || [];
    const items = itemsResult.data || [];
    const charities = charitiesResult.data || [];
    const deletions = deletionsResult.data || [];

    const deletedByTable = deletions.reduce(
      (acc: any, del: any) => {
        if (!acc[del.table_name]) acc[del.table_name] = [];
        acc[del.table_name].push(del.record_id);
        return acc;
      },
      { users: [], items: [], charities: [] }
    );

    const allTimestamps = [
      ...users.map((u: any) => new Date(u.updated_at).getTime()),
      ...items.map((i: any) => new Date(i.updated_at).getTime()),
      ...charities.map((c: any) => new Date(c.updated_at).getTime()),
      ...deletions.map((d: any) => new Date(d.deleted_at).getTime()),
    ].filter((t) => !isNaN(t));

    const maxTimestamp =
      allTimestamps.length > 0
        ? new Date(Math.max(...allTimestamps)).toISOString()
        : (lastPulledAt || '1970-01-01T00:00:00.000Z');

    const response = {
      users,
      items,
      charities,
      deleted: deletedByTable,
      lastSyncTimestamp: maxTimestamp,
    };

    console.log('[SYNC/PULL] ✓ Sync data prepared:', {
      users: response.users.length,
      items: response.items.length,
      charities: response.charities.length,
      deleted: {
        users: deletedByTable.users.length,
        items: deletedByTable.items.length,
        charities: deletedByTable.charities.length,
      },
      watermark: maxTimestamp,
    });

    return c.json(response);
  } catch (error) {
    console.error('[SYNC/PULL] Fatal error:', error);
    return c.json(
      {
        error: 'SYNC_PULL_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

app.get('/aura/check/:serialHash', async (c) => {
  try {
    const { AURA_REGISTRY_ADDRESS, BASE_SEPOLIA_RPC } = c.env;
    const serialHash = c.req.param('serialHash');

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC || 'https://sepolia.base.org'),
    });

    const [isItemStolen, reportTime, reason] = await publicClient.readContract({
      address: AURA_REGISTRY_ADDRESS as `0x${string}`,
      abi: AURA_REGISTRY_ABI,
      functionName: 'checkItemStatus',
      args: [serialHash as `0x${string}`],
    });

    return c.json({
      serialHash,
      isStolen: isItemStolen,
      reportedAt: reportTime ? new Date(Number(reportTime) * 1000).toISOString() : null,
      reason: reason || null,
    });
  } catch (error) {
    console.error('[AURA/CHECK] Error:', error);
    return c.json(
      {
        error: 'AURA_CHECK_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default app;

export { AuctionRoomDO } from './durable-objects/AuctionRoom';
