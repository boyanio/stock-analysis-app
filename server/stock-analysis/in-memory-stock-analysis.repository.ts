import { SharePrice, TimeRange } from "./stock-analysis.models";
import { IStockAnalysisRepository } from "./stock-analysis.repository";

export class InMemoryStockAnalysisRepository
  implements IStockAnalysisRepository
{
  constructor(private records: SharePrice[]) {}

  getRecords(timeRange: TimeRange): SharePrice[] {
    const { startTime, endTime } = timeRange;
    return this.records.filter(
      (item) => item.timestamp >= startTime && item.timestamp <= endTime
    );
  }
}
