'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { useBinanceAPI } from '@/hooks/useBinanceAPI';
import { TRADING_PAIRS } from '@/lib/constants';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { tickers, user } = useAppStore();
  const { isConnected } = useBinanceWebSocket();
  const { isLoading, error } = useBinanceAPI();

  const getPriceChangeClass = (changePercent: string) => {
    const change = parseFloat(changePercent);
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getPriceIcon = (changePercent: string) => {
    const change = parseFloat(changePercent);
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">₿</span>
              </div>
              <h1 className="text-2xl font-bold">Crypto Exchange Simulator</h1>
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-primary font-medium">
                Home
              </Link>
              <Link href="/markets" className="text-muted-foreground hover:text-foreground transition-colors">
                Markets
              </Link>
              <Link href="/trade" className="text-muted-foreground hover:text-foreground transition-colors">
                Trade
              </Link>
              <Link href="/portfolio" className="text-muted-foreground hover:text-foreground transition-colors">
                Portfolio
              </Link>
              <Link href="/history" className="text-muted-foreground hover:text-foreground transition-colors">
                History
              </Link>
              {user.isAuthenticated ? (
                <button 
                  onClick={() => useAppStore.getState().logout()}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link 
                  href="/login"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-muted-foreground">
              {isConnected ? 'Connected to Binance WebSocket' : 'Disconnected - Using API polling'}
            </span>
          </div>
          {error && (
            <span className="text-red-500">API Error: {error}</span>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Live Market Prices</h2>
          <p className="text-muted-foreground">
            Real-time cryptocurrency prices from Binance
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse-slow">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {TRADING_PAIRS.map((symbol) => {
              const ticker = tickers[symbol];
              if (!ticker) return null;

              return (
                <Link
                  key={symbol}
                  href={`/trade?symbol=${symbol}`}
                  className="bg-card border border-border rounded-lg p-6 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {symbol.replace('USDT', '')}
                    </h3>
                    <div className={`flex items-center space-x-1 ${getPriceChangeClass(ticker.priceChangePercent)}`}>
                      {getPriceIcon(ticker.priceChangePercent)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold number-mono">
                      {formatCurrency(ticker.lastPrice)}
                    </div>
                    
                    <div className={`text-sm font-medium ${getPriceChangeClass(ticker.priceChangePercent)}`}>
                      {formatPercent(ticker.priceChangePercent)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>24h High:</span>
                        <span className="number-mono">{formatCurrency(ticker.highPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>24h Low:</span>
                        <span className="number-mono">{formatCurrency(ticker.lowPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume:</span>
                        <span className="number-mono">{formatLargeNumber(ticker.volume)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        </main>
    </div>
  );
}
