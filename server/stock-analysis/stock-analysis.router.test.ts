import request from "supertest";
import express from "express";
import { stockAnalysisRouter } from "./stock-analysis.router";
import { InMemoryStockAnalysisRepository } from "./in-memory-stock-analysis.repository";
import { SharePrice } from "./stock-analysis.models";

describe("Stock Analysis API", () => {
  it.each([
    [[10, 10, 11, 11], 0, 3],
    [[10, 11, 11, 11], 0, 3],
    [[10, 11, 14, 16], 0, 3],
    [[10, 15, 15, 16], 0, 3],
  ])(
    "should perform stock analysis when price goes up only",
    async (prices, expectedBuyIndex, expectedSellIndex) => {
      const records = toRecords(prices);
      const app = createApp(records, { batchSizeInSecs: 2 });
      const res = await request(app)
        .get("/api/stock-analysis?startTime=0&endTime=3000")
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        buy: records[expectedBuyIndex],
        sell: records[expectedSellIndex],
      });
    }
  );

  it.each([1, 2, 3, 4, 5])(
    "should perform stock analysis when price fluctuates",
    async (batchSizeInSecs) => {
      const records = toRecords([
        10.98, 9.67, 8.23, 7.89, 13.11, 13.11, 13.11, 9.05, 10.06, 12.01, 12.01,
        15.15, 5.76,
      ]);
      const app = createApp(records, { batchSizeInSecs });
      const res = await request(app)
        .get("/api/stock-analysis?startTime=0&endTime=20000")
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        buy: { timestamp: 3000, price: 7.89 },
        sell: { timestamp: 11000, price: 15.15 },
      });
    }
  );

  it("should perform stock analysis when time range start is before the min timestamp", async () => {
    const records: SharePrice[] = [
      { timestamp: 5000, price: 10 },
      { timestamp: 6000, price: 11 },
    ];
    const app = createApp(records, { batchSizeInSecs: 2 });
    const res = await request(app)
      .get("/api/stock-analysis?startTime=0&endTime=6000")
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      buy: { timestamp: 5000, price: 10 },
      sell: { timestamp: 6000, price: 11 },
    });
  });

  it("should perform stock analysis when time range end is after the max timestamp", async () => {
    const records: SharePrice[] = [
      { timestamp: 5000, price: 10 },
      { timestamp: 6000, price: 11 },
    ];
    const app = createApp(records, { batchSizeInSecs: 2 });
    const res = await request(app)
      .get("/api/stock-analysis?startTime=5000&endTime=10000")
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      buy: { timestamp: 5000, price: 10 },
      sell: { timestamp: 6000, price: 11 },
    });
  });

  it.each([[[10, 10, 10]], [[10, 9, 9]], [[10, 9, 8]]])(
    "should return conflict when price does not go up",
    async (prices) => {
      const records = toRecords(prices);
      const app = createApp(records, { batchSizeInSecs: 2 });
      const res = await request(app)
        .get("/api/stock-analysis?startTime=0&endTime=2000")
        .send();
      expect(res.statusCode).toEqual(409);
      expect(res.body).toEqual({
        error: "Cannot determine optimal buy & sell points.",
      });
    }
  );

  it("should return bad request when start time is invalid", async () => {
    const app = createApp([], { batchSizeInSecs: 2 });
    const res = await request(app)
      .get("/api/stock-analysis?startTime=invalid&endTime=2000")
      .send();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "Invalid start time.",
    });
  });

  it("should return bad request when end time is invalid", async () => {
    const app = createApp([], { batchSizeInSecs: 2 });
    const res = await request(app)
      .get("/api/stock-analysis?startTime=1000&endTime=invalid")
      .send();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "Invalid end time.",
    });
  });

  it("should return bad request when there are no records within the given time range", async () => {
    const app = createApp([], { batchSizeInSecs: 2 });
    const res = await request(app)
      .get("/api/stock-analysis?startTime=1000&endTime=2000")
      .send();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "No records matching the given time range.",
    });
  });
});

function toRecords(prices: number[]) {
  return prices.map<SharePrice>((price, index) => ({
    timestamp: index * 1000,
    price,
  }));
}

function createApp(
  records: SharePrice[],
  options: { batchSizeInSecs: number }
) {
  const app = express();
  app.use(
    "/api/stock-analysis",
    stockAnalysisRouter(new InMemoryStockAnalysisRepository(records), options)
  );
  return app;
}
