'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

type SortField = 'timestamp' | 'symbol' | 'side' | 'price' | 'amount' | 'total' | 'fee';
type SortDirection = 'asc' | 'desc';

export default function HistoryPage() {
  const { trades, orders } = useAppStore();
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'side':
          comparison = a.side.localeCompare(b.side);
          break;
        case 'price':
          comparison = parseFloat(a.price) - parseFloat(b.price);
          break;
        case 'amount':
          comparison = parseFloat(a.amount) - parseFloat(b.amount);
          break;
        case 'total':
          comparison = parseFloat(a.total) - parseFloat(b.total);
          break;
        case 'fee':
          comparison = parseFloat(a.fee || '0') - parseFloat(b.fee || '0');
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [trades, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSideClass = (side: 'buy' | 'sell') => {
    return side === 'buy' ? 'text-green-500' : 'text-red-500';
  };

  const getSideBadgeClass = (side: 'buy' | 'sell') => {
    return side === 'buy' 
      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
      : 'bg-red-500/10 text-red-500 border-red-500/20';
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
              <Link href="/portfolio" className="text-muted-foreground hover:text-foreground transition-colors">
                Portfolio
              </Link>
              <Link href="/history" className="text-primary font-medium">
                History
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Trade History</h2>
          <p className="text-muted-foreground">
            View your complete trading history and executed orders
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Trades</h3>
            <div className="text-2xl font-bold number-mono">
              {trades.length}
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Volume</h3>
            <div className="text-2xl font-bold number-mono">
              {formatCurrency(trades.reduce((sum, trade) => sum + parseFloat(trade.total), 0))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Fees</h3>
            <div className="text-2xl font-bold number-mono">
              {formatCurrency(trades.reduce((sum, trade) => sum + parseFloat(trade.fee || '0'), 0))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Open Orders</h3>
            <div className="text-2xl font-bold number-mono">
              {orders.filter(order => order.status === 'pending').length}
            </div>
          </div>
        </div>

        {/* Trades Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">
                    <button
                      onClick={() => handleSort('timestamp')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <span>Time</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button
                      onClick={() => handleSort('symbol')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <span>Pair</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium">
                    <button
                      onClick={() => handleSort('side')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <span>Side</span>
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
                      onClick={() => handleSort('amount')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors justify-end"
                    >
                      <span>Amount</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right p-4 font-medium">
                    <button
                      onClick={() => handleSort('total')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors justify-end"
                    >
                      <span>Total</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right p-4 font-medium">
                    <button
                      onClick={() => handleSort('fee')}
                      className="flex items-center space-x-1 hover:text-primary transition-colors justify-end"
                    >
                      <span>Fee</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      No trades executed yet. Start trading to see your history here.
                    </td>
                  </tr>
                ) : (
                  sortedTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="text-sm">
                          {formatDate(trade.timestamp)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{trade.symbol.replace('USDT', '')}</span>
                          <span className="text-muted-foreground">/USDT</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSideBadgeClass(trade.side)}`}>
                          {trade.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right number-mono">
                        {formatCurrency(trade.price)}
                      </td>
                      <td className="p-4 text-right number-mono">
                        {formatNumber(trade.amount)}
                      </td>
                      <td className="p-4 text-right number-mono">
                        {formatCurrency(trade.total)}
                      </td>
                      <td className="p-4 text-right number-mono text-muted-foreground">
                        {trade.fee ? formatCurrency(trade.fee) : '-'}
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
