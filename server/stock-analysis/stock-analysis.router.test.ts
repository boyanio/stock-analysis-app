import request from "supertest";
import express from "express";
import { stockAnalysisRouter } from "./stock-analysis.router";
import { InMemoryStockAnalysisRepository } from "./in-memory-stock-analysis.repository";
import { SharePrice } from "./stock-analysis.models";

const createApp = (records: SharePrice[]) => {
  const app = express();
  app.use(
    "/api/stock-analysis",
    stockAnalysisRouter(new InMemoryStockAnalysisRepository(records))
  );
  return app;
};

describe("Stock Analysis API", () => {
  it.each([
    [[10, 10, 11], 0, 2],
    [[10, 11, 11], 0, 2],
    [[10, 11, 12], 0, 2],
  ])(
    "should perform stock analysis when price goes up only",
    async (prices, expectedBuyIndex, expectedSellIndex) => {
      const records: SharePrice[] = prices.map((price, index) => ({
        timestamp: index,
        price,
      }));
      const app = createApp(records);
      const res = await request(app)
        .get("/api/stock-analysis?startTime=0&endTime=2")
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        buy: records[expectedBuyIndex],
        sell: records[expectedSellIndex],
      });
    }
  );

  it("should perform stock analysis when price fluctuates", async () => {
    const app = createApp([
      { timestamp: 0, price: 10.98 },
      { timestamp: 1, price: 13.11 },
      { timestamp: 2, price: 9.05 },
      { timestamp: 3, price: 10.06 },
      { timestamp: 4, price: 12.01 },
      { timestamp: 5, price: 15.15 },
      { timestamp: 6, price: 5.76 },
    ]);
    const res = await request(app)
      .get("/api/stock-analysis?startTime=0&endTime=6")
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      buy: { timestamp: 2, price: 9.05 },
      sell: { timestamp: 5, price: 15.15 },
    });
  });

  it.each([[[10, 10, 10]], [[10, 9, 9]], [[10, 9, 8]]])(
    "should return conflict when price does not go up",
    async (prices) => {
      const app = createApp(
        prices.map((price, index) => ({ timestamp: index, price }))
      );
      const res = await request(app)
        .get("/api/stock-analysis?startTime=0&endTime=2")
        .send();
      expect(res.statusCode).toEqual(409);
      expect(res.body).toEqual({
        error: "cannot determine optimal buy & sell points",
      });
    }
  );

  it("should return bad request when start time is invalid", async () => {
    const app = createApp([]);
    const res = await request(app)
      .get("/api/stock-analysis?startTime=invalid&endTime=2")
      .send();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "invalid start time",
    });
  });

  it("should return bad request when end time is invalid", async () => {
    const app = createApp([]);
    const res = await request(app)
      .get("/api/stock-analysis?startTime=1&endTime=invalid")
      .send();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "invalid end time",
    });
  });

  it("should return bad request when there are no records within the given time range", async () => {
    const app = createApp([]);
    const res = await request(app)
      .get("/api/stock-analysis?startTime=1&endTime=2")
      .send();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "no records matching the given time range",
    });
  });
});
