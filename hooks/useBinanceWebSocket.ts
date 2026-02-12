import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { BINANCE_WS_BASE, TRADING_PAIRS, WS_STREAMS, WS_RECONNECT_DELAY, WS_MAX_RETRIES } from '@/lib/constants';

export function useBinanceWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { updateTickers, updateTicker, selectedSymbol, updateOrderBook } = useAppStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const tickerStreams = TRADING_PAIRS.map(pair => `${pair.toLowerCase()}${WS_STREAMS.TICKER}`);
    const depthStream = `${selectedSymbol.toLowerCase()}${WS_STREAMS.DEPTH}`;
    const allStreams = [...tickerStreams, depthStream].join('/');

    const wsUrl = `${BINANCE_WS_BASE}/stream?streams=${allStreams}`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.stream && data.data) {
            const streamType = data.stream.split('@')[1];
            
            if (streamType === 'ticker') {
              const tickerData = data.data;
              updateTicker(tickerData.symbol, tickerData);
            } else if (streamType === 'depth') {
              const depthData = data.data;
              updateOrderBook(depthData.bids, depthData.asks, depthData.lastUpdateId);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        if (event.code !== 1000 && reconnectAttempts.current < WS_MAX_RETRIES) {
          const delay = WS_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [selectedSymbol, updateTicker, updateOrderBook]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      disconnect();
      setTimeout(connect, 100);
    }
  }, [selectedSymbol, connect, disconnect]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect: connect,
    disconnect
  };
}
