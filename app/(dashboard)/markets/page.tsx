'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useBinanceAPI } from '@/hooks/useBinanceAPI';
import { TRADING_PAIRS } from '@/lib/constants';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

type SortField = 'symbol' | 'price' | 'change' | 'volume';
type SortDirection = 'asc' | 'desc';

export default function MarketsPage() {
  const { tickers } = useAppStore();
  const { isLoading, error } = useBinanceAPI();
  const [sortField, setSortField] = useState<SortField>('volume');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedTickers = useMemo(() => {
    const tickerArray = TRADING_PAIRS
      .map(symbol => tickers[symbol])
      .filter(Boolean);

    return tickerArray.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'price':
          comparison = parseFloat(a.lastPrice) - parseFloat(b.lastPrice);
          break;
        case 'change':
          comparison = parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent);
          break;
        case 'volume':
          comparison = parseFloat(a.volume) - parseFloat(b.volume);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tickers, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

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
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/markets" className="text-primary font-medium">
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
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Markets</h2>
          <p className="text-muted-foreground">
            Browse all available cryptocurrency markets
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <span className="text-destructive">Error: {error}</span>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">
                    <button
                      onClick={() => handleSort('symbol')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <span>Pair</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right p-4 font-medium">
                    <button
                      onClick={() => handleSort('price')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors justify-end"
                    >
                      <span>Price</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right p-4 font-medium">
                    <button
                      onClick={() => handleSort('change')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors justify-end"
                    >
                      <span>24h Change</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right p-4 font-medium">
                    <button
                      onClick={() => handleSort('volume')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors justify-end"
                    >
                      <span>24h Volume</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right p-4 font-medium">High</th>
                  <th className="text-right p-4 font-medium">Low</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-border animate-pulse-slow">
                      <td className="p-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                      <td className="p-4 text-right"><div className="h-4 bg-muted rounded w-20 ml-auto"></div></td>
                      <td className="p-4 text-right"><div className="h-4 bg-muted rounded w-16 ml-auto"></div></td>
                      <td className="p-4 text-right"><div className="h-4 bg-muted rounded w-20 ml-auto"></div></td>
                      <td className="p-4 text-right"><div className="h-4 bg-muted rounded w-20 ml-auto"></div></td>
                      <td className="p-4 text-right"><div className="h-4 bg-muted rounded w-20 ml-auto"></div></td>
                    </tr>
                  ))
                ) : (
                  sortedTickers.map((ticker) => (
                    <tr 
                      key={ticker.symbol}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <Link 
                          href={`/trade?symbol=${ticker.symbol}`}
                          className="flex items-center space-x-2 hover:text-primary transition-colors"
                        >
                          <span className="font-medium">{ticker.symbol.replace('USDT', '')}</span>
                          <span className="text-muted-foreground">/USDT</span>
                        </Link>
                      </td>
                      <td className="p-4 text-right number-mono">
                        {formatCurrency(ticker.lastPrice)}
                      </td>
                      <td className="p-4 text-right">
                        <div className={`flex items-center justify-end space-x-1 ${getPriceChangeClass(ticker.priceChangePercent)}`}>
                          {getPriceIcon(ticker.priceChangePercent)}
                          <span className="font-medium number-mono">
                            {formatPercent(ticker.priceChangePercent)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right number-mono">
                        {formatLargeNumber(ticker.volume)}
                      </td>
                      <td className="p-4 text-right number-mono text-muted-foreground">
                        {formatCurrency(ticker.highPrice)}
                      </td>
                      <td className="p-4 text-right number-mono text-muted-foreground">
                        {formatCurrency(ticker.lowPrice)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
