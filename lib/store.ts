import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, TickerData, Order, Trade, Balance, Portfolio } from '@/types';
import { DEFAULT_BALANCES, STORAGE_KEYS } from '@/lib/constants';

interface AppStore extends AppState {
  login: (username: string) => void;
  logout: () => void;
  updateBalance: (asset: string, free: string, locked?: string) => void;
  calculatePortfolioValue: (tickers: Record<string, TickerData>) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  cancelOrder: (orderId: string) => void;
  addTrade: (trade: Trade) => void;
  updateTickers: (tickers: Record<string, TickerData>) => void;
  updateTicker: (symbol: string, ticker: TickerData) => void;
  setSelectedSymbol: (symbol: string) => void;
  updateOrderBook: (bids: any[], asks: any[], lastUpdate: number) => void;
}

const initialPortfolio: Portfolio = {
  balances: Object.entries(DEFAULT_BALANCES).reduce((acc, [asset, amount]) => {
    acc[asset] = {
      asset,
      free: amount,
      locked: '0',
      total: amount
    };
    return acc;
  }, {} as Record<string, Balance>),
  totalValue: '0',
  totalPnL: '0'
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: {
        isAuthenticated: false,
        username: undefined
      },
      portfolio: initialPortfolio,
      orders: [],
      trades: [],
      selectedSymbol: 'BTCUSDT',
      tickers: {},
      orderBook: {
        bids: [],
        asks: [],
        lastUpdate: 0
      },

      // User actions
      login: (username: string) => {
        set((state) => ({
          user: {
            isAuthenticated: true,
            username
          }
        }));
      },

      logout: () => {
        set((state) => ({
          user: {
            isAuthenticated: false,
            username: undefined
          }
        }));
      },

      // Portfolio actions
      updateBalance: (asset: string, free: string, locked: string = '0') => {
        set((state) => {
          const total = (parseFloat(free) + parseFloat(locked)).toString();
          return {
            portfolio: {
              ...state.portfolio,
              balances: {
                ...state.portfolio.balances,
                [asset]: {
                  asset,
                  free,
                  locked,
                  total
                }
              }
            }
          };
        });
      },

      calculatePortfolioValue: (tickers: Record<string, TickerData>) => {
        const { portfolio } = get();
        let totalValue = 0;

        Object.entries(portfolio.balances).forEach(([asset, balance]) => {
          const amount = parseFloat(balance.total);
          if (asset === 'USDT') {
            totalValue += amount;
          } else if (tickers[`${asset}USDT`]) {
            const price = parseFloat(tickers[`${asset}USDT`].lastPrice);
            totalValue += amount * price;
          }
        });

        set((state) => ({
          portfolio: {
            ...state.portfolio,
            totalValue: totalValue.toFixed(2),
            totalPnL: '0' // TODO: Calculate PnL based on initial portfolio value
          }
        }));
      },

      // Order actions
      addOrder: (order: Order) => {
        set((state) => ({
          orders: [...state.orders, order]
        }));
      },

      updateOrder: (orderId: string, updates: Partial<Order>) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, ...updates } : order
          )
        }));
      },

      cancelOrder: (orderId: string) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, status: 'cancelled' } : order
          )
        }));
      },

      // Trade actions
      addTrade: (trade: Trade) => {
        set((state) => ({
          trades: [...state.trades, trade]
        }));
      },

      // Market data actions
      updateTickers: (tickers: Record<string, TickerData>) => {
        set({ tickers });
        get().calculatePortfolioValue(tickers);
      },

      updateTicker: (symbol: string, ticker: TickerData) => {
        set((state) => ({
          tickers: {
            ...state.tickers,
            [symbol]: ticker
          }
        }));
        get().calculatePortfolioValue({ ...get().tickers, [symbol]: ticker });
      },

      setSelectedSymbol: (symbol: string) => {
        set({ selectedSymbol: symbol });
      },

      updateOrderBook: (bids: any[], asks: any[], lastUpdate: number) => {
        set((state) => ({
          orderBook: {
            bids: bids.map(([price, amount]) => ({
              price,
              amount,
              total: (parseFloat(price) * parseFloat(amount)).toFixed(2)
            })),
            asks: asks.map(([price, amount]) => ({
              price,
              amount,
              total: (parseFloat(price) * parseFloat(amount)).toFixed(2)
            })),
            lastUpdate
          }
        }));
      }
    }),
    {
      name: STORAGE_KEYS.USER_AUTH,
      partialize: (state) => ({
        user: state.user,
        portfolio: state.portfolio,
        orders: state.orders,
        trades: state.trades
      })
    }
  )
);
