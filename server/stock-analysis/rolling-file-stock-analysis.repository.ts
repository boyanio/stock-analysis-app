import { SharePrice, TimeRange } from "./stock-analysis.models";
import { IStockAnalysisRepository } from "./stock-analysis.repository";
import fs from "fs";
import path from "path";

const filePath = path.resolve(__dirname, "one-day-stock-price-history.txt");
const ONE_SECOND_IN_MILLIS = 1000;

export class RollingFileStockAnalysisRepository
  implements IStockAnalysisRepository
{
  private minTimestamp: number;
  private maxTimestamp: number;

  constructor(limits: { minTimestamp: number; maxTimestamp: number }) {
    if (limits.minTimestamp >= limits.maxTimestamp) {
      throw new Error("Min timestamp should be before max timestamp.");
    }

    this.minTimestamp = roundUpToSecond(limits.minTimestamp);
    this.maxTimestamp = roundDownToSecond(limits.maxTimestamp);
  }

  getRecords(timeRange: TimeRange): SharePrice[] {
    if (
      timeRange.endTime < this.minTimestamp ||
      timeRange.startTime > this.maxTimestamp
    ) {
      return [];
    }

    const contents = fs.readFileSync(filePath, "utf-8");
    const lines = contents.split(/\n/g);

    const startTime = Math.max(
      roundUpToSecond(timeRange.startTime),
      this.minTimestamp
    );
    const endTime = Math.min(
      roundDownToSecond(timeRange.endTime),
      this.maxTimestamp
    );
    const numberOfRecords = (endTime - startTime) / ONE_SECOND_IN_MILLIS + 1;
    const startOfDayTime = roundDownToDay(startTime);
    const startIndex = (startTime - startOfDayTime) / ONE_SECOND_IN_MILLIS;

    const records: SharePrice[] = [];
    let i = startIndex;
    let timestamp = startTime;

    while (true) {
      records.push({ timestamp, price: +lines[i] });
      if (records.length === numberOfRecords) {
        break;
      }

      timestamp += ONE_SECOND_IN_MILLIS;

      i++;
      if (i >= lines.length) {
        i = 0;
      }
    }

    return records;
  }
}

function roundDownToSecond(timestamp: number): number {
  return timestamp - (timestamp % ONE_SECOND_IN_MILLIS);
}

function roundUpToSecond(timestamp: number): number {
  return Math.ceil(timestamp / ONE_SECOND_IN_MILLIS) * ONE_SECOND_IN_MILLIS;
}

function roundDownToDay(timestamp: number): number {
  return timestamp - (timestamp % (ONE_SECOND_IN_MILLIS * 60 * 60 * 24));
}
