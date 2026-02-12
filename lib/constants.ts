export const BINANCE_API_BASE = 'https://api.binance.com';
export const BINANCE_WS_BASE = 'wss://stream.binance.com:9443';

export const TRADING_PAIRS = [
  'BTCUSDT',
  'ETHUSDT', 
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'LINKUSDT'
] as const;

export const WS_STREAMS = {
  TICKER: '@ticker',
  DEPTH: '@depth',
  DEPTH_100MS: '@depth@100ms',
  KLINE: '@kline_1m',
  TRADE: '@trade'
} as const;

export const ORDER_BOOK_LIMIT = 20;
export const ORDER_BOOK_DEPTH_LIMIT = 100;

export const CHART_INTERVALS = {
  '1m': '@kline_1m',
  '5m': '@kline_5m',
  '15m': '@kline_15m',
  '1h': '@kline_1h',
  '4h': '@kline_4h',
  '1d': '@kline_1d'
} as const;

export const DEFAULT_BALANCES = {
  BTC: '10',
  ETH: '100', 
  USDT: '50000',
  SOL: '200',
  BNB: '50',
  XRP: '10000',
  ADA: '5000',
  DOGE: '100000',
  AVAX: '100',
  DOT: '500',
  LINK: '300'
} as const;

export const WS_RECONNECT_DELAY = 1000;
export const WS_MAX_RETRIES = 5;
export const API_POLL_INTERVAL = 15000;

export const PRICE_COLORS = {
  UP: '#10b981',
  DOWN: '#ef4444',
  NEUTRAL: '#6b7280'
} as const;

export const STORAGE_KEYS = {
  USER_AUTH: 'crypto-exchange-auth',
  USER_BALANCES: 'crypto-exchange-balances',
  USER_ORDERS: 'crypto-exchange-orders',
  USER_TRADES: 'crypto-exchange-trades'
} as const;
