import { SharePrice, TimeRange } from "./stock-analysis.models";

export interface IStockAnalysisRepository {
  getRecords(timeRange: TimeRange): SharePrice[];
}
