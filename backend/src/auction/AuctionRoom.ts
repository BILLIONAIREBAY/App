import { DurableObject } from 'cloudflare:workers';
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  AUCTION_ROOM: DurableObjectNamespace;
}

interface BidMessage {
  type: 'bid';
  userId: string;
  amount: number;
}

interface AuctionState {
  auctionId: string;
  currentPrice: number;
  highestBidder: string | null;
  endTime: number;
  bidsHistory: Array<{ userId: string; amount: number; timestamp: number }>;
  startPrice: number;
  reservePrice?: number;
}

export class AuctionRoomDO extends DurableObject<Env> {
  private state: AuctionState | null = null;
  private sessions: Set<WebSocket> = new Set();
  private initialized = false;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async initialize(auctionId: string) {
    if (this.initialized) return;

    const supabase = createClient(
      this.env.SUPABASE_URL,
      this.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: auction, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (error || !auction) {
      throw new Error(`Auction ${auctionId} not found`);
    }

    this.state = {
      auctionId,
      currentPrice: parseFloat(auction.current_price || auction.start_price),
      highestBidder: auction.highest_bidder_id || null,
      endTime: new Date(auction.end_time).getTime(),
      bidsHistory: [],
      startPrice: parseFloat(auction.start_price),
      reservePrice: auction.reserve_price ? parseFloat(auction.reserve_price) : undefined,
    };

    const scheduledTime = new Date(this.state.endTime);
    await this.ctx.storage.setAlarm(scheduledTime);

    this.initialized = true;
    console.log('[AuctionRoomDO] Initialized:', auctionId);
  }

  async placeBid(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    if (!this.state) {
      return { success: false, error: 'Auction not initialized' };
    }

    const now = Date.now();

    if (now >= this.state.endTime) {
      return { success: false, error: 'Auction has ended' };
    }

    if (amount <= this.state.currentPrice) {
      return { success: false, error: `Bid must be higher than ${this.state.currentPrice}` };
    }

    this.state.currentPrice = amount;
    this.state.highestBidder = userId;
    this.state.bidsHistory.push({ userId, amount, timestamp: now });

    if (now > this.state.endTime - 30000) {
      this.state.endTime += 30000;
      console.log('[AuctionRoomDO] Anti-Snipe triggered: +30s');
      
      const newScheduledTime = new Date(this.state.endTime);
      await this.ctx.storage.setAlarm(newScheduledTime);
    }

    this.broadcast({
      type: 'auction_update',
      data: {
        currentPrice: this.state.currentPrice,
        highestBidder: this.state.highestBidder,
        endTime: this.state.endTime,
        totalBids: this.state.bidsHistory.length,
      },
    });

    return { success: true };
  }

  async alarm() {
    console.log('[AuctionRoomDO] Alarm triggered - Auction ended');

    if (!this.state) return;

    const supabase = createClient(
      this.env.SUPABASE_URL,
      this.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabase
      .from('auctions')
      .update({
        status: 'ended',
        current_price: this.state.currentPrice,
        highest_bidder_id: this.state.highestBidder,
        total_bids: this.state.bidsHistory.length,
      })
      .eq('id', this.state.auctionId);

    if (this.state.bidsHistory.length > 0) {
      const bidsToInsert = this.state.bidsHistory.slice(-100).map((bid) => ({
        auction_id: this.state!.auctionId,
        bidder_id: bid.userId,
        amount: bid.amount,
        created_at: new Date(bid.timestamp).toISOString(),
      }));

      await supabase.from('bids').insert(bidsToInsert);
    }

    this.broadcast({
      type: 'auction_ended',
      data: {
        finalPrice: this.state.currentPrice,
        winner: this.state.highestBidder,
      },
    });

    this.sessions.forEach((ws) => ws.close(1000, 'Auction ended'));
    this.sessions.clear();
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const auctionId = url.searchParams.get('auctionId') || segments[segments.length - 1];

    if (!auctionId) {
      return new Response('Missing auctionId', { status: 400 });
    }

    if (!this.initialized) {
      await this.initialize(auctionId);
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);
    this.sessions.add(server);

    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);

        if (message.type === 'bid') {
          const result = await this.placeBid(message.userId, message.amount);
          server.send(JSON.stringify({ type: 'bid_result', ...result }));
        }
      } catch (error) {
        console.error('[AuctionRoomDO] Message error:', error);
        server.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      }
    });

    server.addEventListener('close', () => {
      this.sessions.delete(server);
    });

    if (this.state) {
      server.send(
        JSON.stringify({
          type: 'auction_state',
          data: {
            currentPrice: this.state.currentPrice,
            highestBidder: this.state.highestBidder,
            endTime: this.state.endTime,
            totalBids: this.state.bidsHistory.length,
          },
        })
      );
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private broadcast(message: any) {
    const payload = JSON.stringify(message);
    this.sessions.forEach((session) => {
      try {
        session.send(payload);
      } catch (error) {
        console.error('[AuctionRoomDO] Broadcast error:', error);
        this.sessions.delete(session);
      }
    });
  }
}
