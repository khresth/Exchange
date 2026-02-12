'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { useBinanceAPI } from '@/hooks/useBinanceAPI';
import { matchingEngine } from '@/lib/matchingEngine';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

export default function TradePage() {
  const searchParams = useSearchParams();
  const { 
    tickers, 
    orderBook, 
    selectedSymbol, 
    setSelectedSymbol,
    portfolio,
    addOrder
  } = useAppStore();
  
  const { isLoading } = useBinanceAPI();
  
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');

  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const ticker = tickers[symbol];
  const currentPrice = ticker?.lastPrice || '0';

  useEffect(() => {
    setSelectedSymbol(symbol);
  }, [symbol, setSelectedSymbol]);

  useEffect(() => {
    if (orderType === 'limit' && price) {
      const totalValue = parseFloat(price) * parseFloat(amount || '0');
      setTotal(totalValue ? totalValue.toFixed(2) : '');
    } else if (orderType === 'market' && amount) {
      setTotal(amount);
    }
  }, [price, amount, orderType]);

  useEffect(() => {
    if (orderType === 'limit' && orderSide === 'buy') {
      setPrice(orderBook.asks[0]?.price || currentPrice);
    } else if (orderType === 'limit' && orderSide === 'sell') {
      setPrice(orderBook.bids[0]?.price || currentPrice);
    }
  }, [orderBook, orderSide, orderType, currentPrice]);

  const handlePlaceOrder = () => {
    if (!amount || (orderType === 'limit' && !price)) return;

    const orderAmount = parseFloat(amount);
    const orderPrice = orderType === 'limit' ? parseFloat(price) : parseFloat(currentPrice);
    
    if (orderAmount <= 0) return;
    if (orderType === 'limit' && orderPrice <= 0) return;

    const asset = symbol.replace('USDT', '');
    const availableAsset = parseFloat(portfolio.balances[asset]?.free || '0');
    const availableUSDT = parseFloat(portfolio.balances.USDT?.free || '0');

    if (orderSide === 'buy' && orderType === 'limit') {
      const requiredUSDT = orderAmount * orderPrice;
      if (requiredUSDT > availableUSDT) {
        alert('Insufficient USDT balance');
        return;
      }
    } else if (orderSide === 'buy' && orderType === 'market') {
      const estimatedUSDT = orderAmount * parseFloat(currentPrice);
      if (estimatedUSDT > availableUSDT * 0.95) {
        alert('Insufficient USDT balance (considering slippage)');
        return;
      }
    } else if (orderSide === 'sell') {
      if (orderAmount > availableAsset) {
        alert(`Insufficient ${asset} balance`);
        return;
      }
    }

    const order = {
      id: Date.now().toString(),
      symbol,
      side: orderSide,
      type: orderType,
      amount: orderType === 'market' ? amount : amount,
      price: orderType === 'limit' ? price : undefined,
      filled: '0',
      remaining: orderType === 'market' ? amount : amount,
      status: 'pending' as const,
      timestamp: Date.now()
    };

    addOrder(order);
    
    if (orderType === 'market') {
      matchingEngine.executeMarketOrder(order);
    } else {
      matchingEngine.addOrder(order);
    }
    
    setAmount('');
    setTotal('');
    if (orderType === 'limit') {
      setPrice('');
    }
  };

  const canPlaceOrder = amount && (orderType === 'market' || price);

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
              <Link href="/trade" className="text-primary font-medium">
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
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold">
              {symbol.replace('USDT', '')}/USDT
            </h2>
            <div className="text-2xl font-bold number-mono">
              {formatCurrency(currentPrice)}
            </div>
            <div className={`text-sm font-medium ${
              parseFloat(ticker?.priceChangePercent || '0') >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {ticker?.priceChangePercent}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Price Chart</h3>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Chart coming soon</span>
              </div>
            </div>

            {/* Order Book */}
            <div className="bg-card border border-border rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Order Book</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Asks */}
                <div>
                  <h4 className="text-sm font-medium text-red-500 mb-2">Asks</h4>
                  <div className="space-y-1">
                    {orderBook.asks.slice(0, 10).map((ask, index) => (
                      <div key={index} className="flex justify-between text-sm order-book-row p-1">
                        <span className="number-mono">{formatCurrency(ask.price)}</span>
                        <span className="number-mono">{formatNumber(ask.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bids */}
                <div>
                  <h4 className="text-sm font-medium text-green-500 mb-2">Bids</h4>
                  <div className="space-y-1">
                    {orderBook.bids.slice(0, 10).map((bid, index) => (
                      <div key={index} className="flex justify-between text-sm order-book-row p-1">
                        <span className="number-mono">{formatCurrency(bid.price)}</span>
                        <span className="number-mono">{formatNumber(bid.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Place Order</h3>
              
              {/* Order Type */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrderType('limit')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      orderType === 'limit' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Limit
                  </button>
                  <button
                    onClick={() => setOrderType('market')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      orderType === 'market' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Market
                  </button>
                </div>
              </div>

              {/* Buy/Sell */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrderSide('buy')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      orderSide === 'buy' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setOrderSide('sell')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      orderSide === 'sell' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              {/* Price */}
              {orderType === 'limit' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Price (USDT)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary number-mono"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              )}

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Amount ({symbol.replace('USDT', '')})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary number-mono"
                  placeholder="0.00"
                  step="0.000001"
                />
              </div>

              {/* Total */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Total (USDT)</label>
                <div className="px-3 py-2 bg-muted border border-border rounded-lg number-mono">
                  {total || '0.00'}
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={!canPlaceOrder}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  canPlaceOrder
                    ? orderSide === 'buy' 
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {orderSide === 'buy' ? 'Buy' : 'Sell'} {symbol.replace('USDT', '')}
              </button>

              {/* Balance Info */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Available {symbol.replace('USDT', '')}:</span>
                    <span className="number-mono">{portfolio.balances[symbol.replace('USDT', '')]?.free || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available USDT:</span>
                    <span className="number-mono">{portfolio.balances.USDT?.free || '0'}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground pt-1 border-t border-border">
                    <span>Total Portfolio Value:</span>
                    <span className="number-mono">${portfolio.totalValue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
