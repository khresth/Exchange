'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useBinanceAPI } from '@/hooks/useBinanceAPI';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioPage() {
  const { portfolio, tickers, trades } = useAppStore();
  const { isLoading } = useBinanceAPI();

  const portfolioData = useMemo(() => {
    const data = Object.entries(portfolio.balances)
      .filter(([_, balance]) => parseFloat(balance.total) > 0)
      .map(([asset, balance]) => {
        const currentPrice = asset === 'USDT' ? '1' : tickers[`${asset}USDT`]?.lastPrice || '0';
        const value = parseFloat(balance.total) * parseFloat(currentPrice);
        const initialValue = parseFloat(balance.total) * (asset === 'BTC' ? 50000 : asset === 'ETH' ? 3000 : 1);
        const pnl = value - initialValue;
        const pnlPercent = initialValue > 0 ? (pnl / initialValue) * 100 : 0;

        return {
          asset,
          balance: balance.total,
          currentPrice,
          value,
          initialValue,
          pnl,
          pnlPercent,
          priceChange24h: tickers[`${asset}USDT`]?.priceChangePercent || '0'
        };
      })
      .sort((a, b) => b.value - a.value);

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const totalPnL = data.reduce((sum, item) => sum + item.pnl, 0);
    const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

    return {
      holdings: data,
      totalValue,
      totalPnL,
      totalPnLPercent
    };
  }, [portfolio.balances, tickers, trades]);

  const getPriceChangeClass = (changePercent: string) => {
    const change = parseFloat(changePercent);
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getPnLClass = (pnl: number) => {
    if (pnl > 0) return 'text-green-500';
    if (pnl < 0) return 'text-red-500';
    return 'text-gray-500';
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
              <Link href="/markets" className="text-muted-foreground hover:text-foreground transition-colors">
                Markets
              </Link>
              <Link href="/trade" className="text-muted-foreground hover:text-foreground transition-colors">
                Trade
              </Link>
              <Link href="/portfolio" className="text-primary font-medium">
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
          <h2 className="text-3xl font-bold mb-2">Portfolio</h2>
          <p className="text-muted-foreground">
            Track your cryptocurrency holdings and performance
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Value</h3>
            <div className="text-2xl font-bold number-mono">
              {formatCurrency(portfolioData.totalValue)}
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total P&L</h3>
            <div className={`text-2xl font-bold number-mono ${getPnLClass(portfolioData.totalPnL)}`}>
              {formatCurrency(portfolioData.totalPnL)}
            </div>
            <div className={`text-sm mt-1 ${getPnLClass(portfolioData.totalPnL)}`}>
              ({portfolioData.totalPnLPercent.toFixed(2)}%)
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Assets</h3>
            <div className="text-2xl font-bold number-mono">
              {portfolioData.holdings.length}
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">Asset</th>
                  <th className="text-right p-4 font-medium">Balance</th>
                  <th className="text-right p-4 font-medium">Current Price</th>
                  <th className="text-right p-4 font-medium">Value</th>
                  <th className="text-right p-4 font-medium">P&L</th>
                  <th className="text-right p-4 font-medium">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border animate-pulse-slow">
                      <td className="p-4"><div className="h-4 bg-muted rounded w-16"></div></td>
                      <td className="p-4 text-right"><div className="h-4 bg-muted rounded w-20 ml-auto"></div></td>
                      <td className="p-4 text-right"><div className="h-4 bg-muted rounded w-20 ml-auto"></div></td>
                      <td className="p-4 text-right"><div className="h-4 bg-muted rounded w-24 ml-auto"></div></td>
                      <td className="p-4 text-right"><div className="h-4 bg-muted rounded w-20 ml-auto"></div></td>
                      <td className="p-4 text-right"><div className="h-4 bg-muted rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : (
                  portfolioData.holdings.map((holding) => (
                    <tr key={holding.asset} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{holding.asset}</span>
                          {holding.asset !== 'USDT' && (
                            <span className="text-muted-foreground">/USDT</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right number-mono">
                        {formatLargeNumber(holding.balance)}
                      </td>
                      <td className="p-4 text-right number-mono">
                        {formatCurrency(holding.currentPrice)}
                      </td>
                      <td className="p-4 text-right number-mono">
                        {formatCurrency(holding.value)}
                      </td>
                      <td className={`p-4 text-right number-mono font-medium ${getPnLClass(holding.pnl)}`}>
                        {formatCurrency(holding.pnl)}
                        <div className="text-xs">
                          ({holding.pnlPercent.toFixed(2)}%)
                        </div>
                      </td>
                      <td className={`p-4 text-right number-mono ${getPriceChangeClass(holding.priceChange24h)}`}>
                        {formatPercent(holding.priceChange24h)}
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
