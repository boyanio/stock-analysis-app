import { SharePrice, TimeRange } from "./stock-analysis.models";
import { IStockAnalysisRepository } from "./stock-analysis.repository";

export class InMemoryStockAnalysisRepository
  implements IStockAnalysisRepository
{
  constructor(private records: SharePrice[]) {}

  getRecords(timeRange: TimeRange): Promise<SharePrice[]> {
    const { startTime, endTime } = timeRange;
    const filteredRecords = this.records.filter(
      (item) => item.timestamp >= startTime && item.timestamp <= endTime
    );
    return Promise.resolve(filteredRecords);
  }
}
