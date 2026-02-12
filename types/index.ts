export interface TickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface DepthData {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface DepthStreamData {
  e: string;
  E: number;
  s: string;
  U: number;
  u: number;
  b: [string, string][];
  a: [string, string][];
}

export interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  amount: string;
  price?: string;
  filled: string;
  remaining: string;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
}

export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: string;
  amount: string;
  total: string;
  fee?: string;
  timestamp: number;
}

export interface Balance {
  asset: string;
  free: string;
  locked: string;
  total: string;
}

export interface Portfolio {
  balances: Record<string, Balance>;
  totalValue: string;
  totalPnL: string;
}

export interface CandlestickData {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface WebSocketMessage {
  stream: string;
  data: any;
}

export interface AppState {
  user: {
    isAuthenticated: boolean;
    username?: string;
  };
  portfolio: Portfolio;
  orders: Order[];
  trades: Trade[];
  selectedSymbol: string;
  tickers: Record<string, TickerData>;
  orderBook: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
    lastUpdate: number;
  };
}
