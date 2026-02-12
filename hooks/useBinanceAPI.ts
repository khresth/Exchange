import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { BINANCE_API_BASE, TRADING_PAIRS, API_POLL_INTERVAL } from '@/lib/constants';
import { TickerData, DepthData } from '@/types';

export function useBinanceAPI() {
  const { updateTickers, updateOrderBook, selectedSymbol } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickers = async () => {
    try {
      const response = await fetch(`${BINANCE_API_BASE}/api/v3/ticker/24hr`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickers');
      }
      
      const data: TickerData[] = await response.json();
      const filteredTickers = data
        .filter(ticker => TRADING_PAIRS.includes(ticker.symbol as any))
        .reduce((acc, ticker) => {
          acc[ticker.symbol] = ticker;
          return acc;
        }, {} as Record<string, TickerData>);
      
      updateTickers(filteredTickers);
      setError(null);
    } catch (err) {
      console.error('Error fetching tickers:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchOrderBook = async (symbol: string) => {
    try {
      const response = await fetch(`${BINANCE_API_BASE}/api/v3/depth?symbol=${symbol}&limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch order book');
      }
      
      const data: DepthData = await response.json();
      updateOrderBook(data.bids, data.asks, data.lastUpdateId);
      setError(null);
    } catch (err) {
      console.error('Error fetching order book:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchTickers(),
        fetchOrderBook(selectedSymbol)
      ]);
      setIsLoading(false);
    };

    loadInitialData();
  }, [selectedSymbol]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickers();
    }, API_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrderBook(selectedSymbol);
    }, API_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return {
    isLoading,
    error,
    refetchTickers: fetchTickers,
    refetchOrderBook: () => fetchOrderBook(selectedSymbol)
  };
}
