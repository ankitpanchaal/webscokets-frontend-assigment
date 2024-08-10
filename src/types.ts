type TSymbol = {
  label: string;
  value: string;
};

// types.ts
type TickData = {
  timestamp_str: string;
  symbol: string;
  ltp: number;
  prev_day_close: number;
  oi: number;
  prev_day_oi: number;
  turnover: number;
  best_bid_price: number;
  best_ask_price: number;
  best_bid_qty: number;
  best_ask_qty: number;
  ttq: number;
  token: string;
};

type ChartDataPoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

interface WatchlistDataItem {
  symbol: string;
  change: string;
  ltp: number;
}
