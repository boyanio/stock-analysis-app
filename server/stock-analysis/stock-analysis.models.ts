export type SharePrice = {
  timestamp: number;
  price: number;
};

export type SharePriceStats = {
  buy: SharePrice;
  sell: SharePrice;
};

export type TimeRange = {
  startTime: number;
  endTime: number;
};

export class NoSharePriceHistoryRecordsError extends Error {}

export class CannotPerformStockAnalysisError extends Error {}
