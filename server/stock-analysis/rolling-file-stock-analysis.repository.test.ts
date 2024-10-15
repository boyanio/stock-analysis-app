import { RollingFileStockAnalysisRepository } from "./rolling-file-stock-analysis.repository";

const ONE_SECOND_IN_MILLIS = 1000;
const ONE_DAY_IN_MILLIS = ONE_SECOND_IN_MILLIS * 60 * 60 * 24;

describe(RollingFileStockAnalysisRepository.name, () => {
  it("should return empty records when querying before min timestamp", async () => {
    const now = new Date().getTime();

    const repository = new RollingFileStockAnalysisRepository({
      minTimestamp: now,
      maxTimestamp: now + 1,
    });
    const records = await repository.getRecords({
      startTime: now - 2,
      endTime: now - 1,
    });
    expect(records.length).toEqual(0);
  });

  it("should return empty records when querying after max timestamp", async () => {
    const now = new Date().getTime();

    const repository = new RollingFileStockAnalysisRepository({
      minTimestamp: now,
      maxTimestamp: now + 1,
    });
    const records = await repository.getRecords({
      startTime: now + 2,
      endTime: now + 3,
    });
    expect(records.length).toEqual(0);
  });

  it("should return 86400 records for a day", async () => {
    const now = new Date().getTime();
    const startOfDay = roundDownToDay(now);
    const endOfDay = startOfDay + ONE_DAY_IN_MILLIS - 1;

    const repository = new RollingFileStockAnalysisRepository({
      minTimestamp: startOfDay,
      maxTimestamp: endOfDay,
    });
    const records = await repository.getRecords({
      startTime: startOfDay,
      endTime: endOfDay,
    });
    expect(records.length).toEqual(86400);
  });

  it("should return records spanning over a day", async () => {
    const now = new Date().getTime();
    const startOfToday = roundDownToDay(now);
    const startOfYesterday = roundDownToDay(now) - ONE_DAY_IN_MILLIS;
    const endOfToday = startOfToday + ONE_DAY_IN_MILLIS - 1;

    const repository = new RollingFileStockAnalysisRepository({
      minTimestamp: startOfYesterday,
      maxTimestamp: endOfToday,
    });
    const startTime = startOfYesterday + 10 * ONE_SECOND_IN_MILLIS;
    const endTime = endOfToday - 10 * ONE_SECOND_IN_MILLIS;
    const records = await repository.getRecords({
      startTime,
      endTime,
    });

    const expectedNumberOfRecords = 2 * 86400 - 2 * 10;
    expect(records.length).toEqual(expectedNumberOfRecords);
    expect(records[0]).toEqual({
      price: 4.077499866485596,
      timestamp: startTime,
    });
    expect(records[records.length - 1]).toEqual({
      price: 81.30000305175781,
      timestamp: roundDownToSecond(endTime),
    });
  });
});

function roundDownToSecond(timestamp: number): number {
  return timestamp - (timestamp % ONE_SECOND_IN_MILLIS);
}

function roundDownToDay(timestamp: number): number {
  return timestamp - (timestamp % ONE_DAY_IN_MILLIS);
}
