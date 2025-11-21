import { useState, useEffect, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'ws://localhost:8787';

interface AuctionState {
  currentPrice: number;
  highestBidder: string | null;
  endTime: number;
  totalBids: number;
}

interface UseAuctionRoomResult {
  currentPrice: number;
  timeLeft: number;
  highestBidder: string | null;
  totalBids: number;
  isConnected: boolean;
  placeBid: (userId: string, amount: number) => Promise<void>;
}

export function useAuctionRoom(auctionId: string): UseAuctionRoomResult {
  const [auctionState, setAuctionState] = useState<AuctionState>({
    currentPrice: 0,
    highestBidder: null,
    endTime: 0,
    totalBids: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!auctionId) return;
    
    const wsUrl = BACKEND_URL.replace(/^http/, 'ws') + `/auction/${auctionId}/websocket`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AuctionRoom] WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'auction_state' || message.type === 'auction_update') {
            setAuctionState(message.data);
          } else if (message.type === 'auction_ended') {
            console.log('[AuctionRoom] Auction ended:', message.data);
            setAuctionState((prev) => ({
              ...prev,
              currentPrice: message.data.finalPrice,
              highestBidder: message.data.winner,
            }));
          } else if (message.type === 'bid_result') {
            if (!message.success) {
              console.error('[AuctionRoom] Bid failed:', message.error);
            }
          }
        } catch (error) {
          console.error('[AuctionRoom] Message parse error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[AuctionRoom] WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('[AuctionRoom] WebSocket closed, reconnecting...');
        setIsConnected(false);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000) as any;
      };
    } catch (error) {
      console.error('[AuctionRoom] Connection error:', error);
    }
  }, [auctionId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (auctionState.endTime > 0) {
        const remaining = Math.max(0, auctionState.endTime - Date.now());
        setTimeLeft(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [auctionState.endTime]);

  const placeBid = useCallback(async (userId: string, amount: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setAuctionState((prev) => ({
      ...prev,
      currentPrice: amount,
      highestBidder: userId,
    }));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'bid',
        userId,
        amount,
      }));
    } else {
      console.error('[AuctionRoom] WebSocket not connected');
    }
  }, []);

  return {
    currentPrice: auctionState.currentPrice,
    timeLeft,
    highestBidder: auctionState.highestBidder,
    totalBids: auctionState.totalBids,
    isConnected,
    placeBid,
  };
}
