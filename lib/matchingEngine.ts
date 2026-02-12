import { Order, Trade, Balance } from '@/types';
import { useAppStore } from '@/lib/store';

class OrderMatchingEngine {
  private bids: Order[] = [];
  private asks: Order[] = [];
  private fees: { maker: number; taker: number } = { maker: 0.001, taker: 0.001 };
  private maxDepth = 100;

  addOrder(order: Order) {
    if (order.side === 'buy') {
      this.bids.push(order);
      this.bids.sort((a, b) => {
        const priceA = parseFloat(a.price || '0');
        const priceB = parseFloat(b.price || '0');
        if (priceA !== priceB) {
          return priceB - priceA;
        }
        return a.timestamp - b.timestamp;
      });
      this.bids = this.bids.slice(0, this.maxDepth);
    } else {
      this.asks.push(order);
      this.asks.sort((a, b) => {
        const priceA = parseFloat(a.price || '0');
        const priceB = parseFloat(b.price || '0');
        if (priceA !== priceB) {
          return priceA - priceB;
        }
        return a.timestamp - b.timestamp;
      });
      this.asks = this.asks.slice(0, this.maxDepth);
    }

    this.tryMatchOrders(order.symbol);
  }

  private tryMatchOrders(symbol: string) {
    const store = useAppStore.getState();
    
    while (this.bids.length > 0 && this.asks.length > 0) {
      const bestBid = this.bids[0];
      const bestAsk = this.asks[0];

      if (!bestBid.price || !bestAsk.price) break;

      const bidPrice = parseFloat(bestBid.price);
      const askPrice = parseFloat(bestAsk.price);

      if (bidPrice >= askPrice) {
        this.executeTrade(bestBid, bestAsk, askPrice, symbol);
      } else {
        break;
      }
    }
  }

  private executeTrade(bid: Order, ask: Order, price: number, symbol: string) {
    const bidAmount = parseFloat(bid.remaining);
    const askAmount = parseFloat(ask.remaining);
    const tradeAmount = Math.min(bidAmount, askAmount);
    const tradeTotal = tradeAmount * price;
    const takerFee = tradeTotal * this.fees.taker;
    const netTotal = tradeTotal - takerFee;

    const trade: Trade = {
      id: Date.now().toString(),
      orderId: bid.id,
      symbol,
      side: 'buy',
      price: price.toFixed(2),
      amount: tradeAmount.toFixed(8),
      total: netTotal.toFixed(2),
      fee: takerFee.toFixed(2),
      timestamp: Date.now()
    };

    const store = useAppStore.getState();

    const bidAsset = symbol.replace('USDT', '');
    const askAsset = 'USDT';

    store.updateBalance(bidAsset, 
      (parseFloat(store.portfolio.balances[bidAsset]?.free || '0') - tradeAmount).toString(),
      store.portfolio.balances[bidAsset]?.locked || '0'
    );

    store.updateBalance(askAsset,
      (parseFloat(store.portfolio.balances[askAsset]?.free || '0') + netTotal).toString(),
      store.portfolio.balances[askAsset]?.locked || '0'
    );

    if (bidAmount > askAmount) {
      bid.remaining = (bidAmount - askAmount).toString();
      bid.filled = (parseFloat(bid.filled) + askAmount).toString();
      store.updateOrder(bid.id, { remaining: bid.remaining, filled: bid.filled });
      
      ask.status = 'filled';
      ask.remaining = '0';
      ask.filled = ask.amount;
      store.updateOrder(ask.id, { status: 'filled', remaining: ask.remaining, filled: ask.filled });
    } else if (askAmount > bidAmount) {
      ask.remaining = (askAmount - bidAmount).toString();
      ask.filled = (parseFloat(ask.filled) + bidAmount).toString();
      store.updateOrder(ask.id, { remaining: ask.remaining, filled: ask.filled });
      
      bid.status = 'filled';
      bid.remaining = '0';
      bid.filled = bid.amount;
      store.updateOrder(bid.id, { status: 'filled', remaining: bid.remaining, filled: bid.filled });
    } else {
      bid.status = 'filled';
      ask.status = 'filled';
      bid.remaining = '0';
      ask.remaining = '0';
      bid.filled = bid.amount;
      ask.filled = ask.amount;
      
      store.updateOrder(bid.id, { status: 'filled', remaining: bid.remaining, filled: bid.filled });
      store.updateOrder(ask.id, { status: 'filled', remaining: ask.remaining, filled: ask.filled });
    }

    store.addTrade(trade);

    this.bids.shift();
    this.asks.shift();

    if (bid.status === 'filled') {
      this.bids.shift();
    }
    if (ask.status === 'filled') {
      this.asks.shift();
    }
  }

  executeMarketOrder(order: Order) {
    const store = useAppStore.getState();
    const oppositeSide = order.side === 'buy' ? 'asks' : 'bids';
    const orderBook = oppositeSide === 'asks' ? store.orderBook.asks : store.orderBook.bids;

    if (orderBook.length === 0) return;

    let remainingAmount = parseFloat(order.amount);
    let filledAmount = 0;
    let totalCost = 0;
    let totalFees = 0;

    for (const level of orderBook) {
      if (remainingAmount <= 0) break;

      const levelAmount = parseFloat(level.amount);
      const levelPrice = parseFloat(level.price);
      const tradeAmount = Math.min(remainingAmount, levelAmount);
      const tradeTotal = tradeAmount * levelPrice;
      const takerFee = tradeTotal * this.fees.taker;
      const netTotal = tradeTotal - takerFee;

      totalCost += netTotal;
      totalFees += takerFee;
      filledAmount += tradeAmount;
      remainingAmount -= tradeAmount;

      const trade: Trade = {
        id: Date.now().toString() + Math.random(),
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        price: levelPrice.toFixed(2),
        amount: tradeAmount.toFixed(8),
        total: netTotal.toFixed(2),
        fee: takerFee.toFixed(2),
        timestamp: Date.now()
      };

      store.addTrade(trade);
    }

    if (filledAmount > 0) {
      const asset = order.side === 'buy' ? order.symbol.replace('USDT', '') : 'USDT';
      const quoteAsset = order.side === 'buy' ? 'USDT' : order.symbol.replace('USDT', '');

      if (order.side === 'buy') {
        store.updateBalance(asset,
          (parseFloat(store.portfolio.balances[asset]?.free || '0') + filledAmount).toString(),
          store.portfolio.balances[asset]?.locked || '0'
        );
        store.updateBalance(quoteAsset,
          (parseFloat(store.portfolio.balances[quoteAsset]?.free || '0') - totalCost).toString(),
          store.portfolio.balances[quoteAsset]?.locked || '0'
        );
      } else {
        store.updateBalance(asset,
          (parseFloat(store.portfolio.balances[asset]?.free || '0') - filledAmount).toString(),
          store.portfolio.balances[asset]?.locked || '0'
        );
        store.updateBalance(quoteAsset,
          (parseFloat(store.portfolio.balances[quoteAsset]?.free || '0') + totalCost).toString(),
          store.portfolio.balances[quoteAsset]?.locked || '0'
        );
      }

      order.status = 'filled';
      order.filled = filledAmount.toFixed(8);
      order.remaining = '0';
      store.updateOrder(order.id, { status: 'filled', filled: order.filled, remaining: order.remaining });
    }
  }
}

export const matchingEngine = new OrderMatchingEngine();
