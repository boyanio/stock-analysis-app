import express, { Router } from "express";
import { IStockAnalysisRepository } from "./stock-analysis.repository";
import { parseTimestamp } from "../util/validation.util";
import {
  STATUS_BAD_REQUEST,
  STATUS_CONFLICT,
} from "../util/http-status-codes.util";
import {
  CannotPerformStockAnalysisError,
  NoSharePriceHistoryRecordsError,
  SharePrice,
  SharePriceStats,
  TimeRange,
} from "./stock-analysis.models";

const ONE_SECOND_IN_MILLIS = 1000;

export function stockAnalysisRouter(
  repository: IStockAnalysisRepository,
  options: { batchSizeInSecs: number }
): Router {
  if (options.batchSizeInSecs < 1) {
    throw new Error("The batch size should be at least 1 second");
  }

  const router = express.Router();

  router.get("/", (req, res) => {
    const startTimeParam = req.query.startTime as string;
    const endTimeParam = req.query.endTime as string;

    const startTime = parseTimestamp(startTimeParam);
    if (startTime === false) {
      return res
        .status(STATUS_BAD_REQUEST)
        .send({ error: "Invalid start time." });
    }

    const endTime = parseTimestamp(endTimeParam);
    if (endTime === false) {
      return res
        .status(STATUS_BAD_REQUEST)
        .send({ error: "Invalid end time." });
    }

    const { batchSizeInSecs } = options;
    try {
      const stats = findBestBuySellIndexesInBatches(
        repository,
        {
          startTime,
          endTime,
        },
        batchSizeInSecs
      );
      return res.json(stats);
    } catch (err) {
      if (err instanceof CannotPerformStockAnalysisError) {
        return res
          .status(STATUS_CONFLICT)
          .send({ error: "Cannot determine optimal buy & sell points." });
      } else if (err instanceof NoSharePriceHistoryRecordsError) {
        return res
          .status(STATUS_BAD_REQUEST)
          .send({ error: "No records matching the given time range." });
      }

      throw err;
    }
  });

  return router;
}

function findBestBuySellIndexesInBatches(
  repository: IStockAnalysisRepository,
  timeRange: TimeRange,
  batchSizeInSecs: number
): SharePriceStats {
  const { startTime, endTime } = timeRange;
  const getBatchEndTime = (batchStartTime: number) =>
    Math.min(
      endTime,
      batchStartTime + (batchSizeInSecs - 1) * ONE_SECOND_IN_MILLIS
    );
  const batchesCount =
    Math.floor(
      (endTime - startTime) / (batchSizeInSecs * ONE_SECOND_IN_MILLIS)
    ) + 1;

  let minPrice = Infinity;
  let minPriceTimestamp = 0;
  let maxProfit = 0;
  let bestBuy: SharePrice | null = null;
  let bestSell: SharePrice | null = null;
  let hasRecords = false;
  let batchStartTime = startTime;
  let batchEndTime = getBatchEndTime(batchStartTime);

  for (let b = 0; b < batchesCount; b++) {
    const batchRecords = repository.getRecords({
      startTime: batchStartTime,
      endTime: batchEndTime,
    });
    if (!batchRecords.length) {
      continue;
    }

    hasRecords = true;

    for (let i = 0; i < batchRecords.length; i++) {
      const sharePrice = batchRecords[i];
      const profit = sharePrice.price - minPrice;

      if (profit >= maxProfit) {
        maxProfit = profit;
        bestBuy = { timestamp: minPriceTimestamp, price: minPrice };
        bestSell = sharePrice;
      }

      if (profit < 0) {
        minPrice = sharePrice.price;
        minPriceTimestamp = sharePrice.timestamp;
      }
    }

    batchStartTime = batchEndTime + ONE_SECOND_IN_MILLIS;
    batchEndTime = getBatchEndTime(batchStartTime);
  }

  if (!hasRecords) {
    throw new NoSharePriceHistoryRecordsError();
  }

  if (!bestBuy || !bestSell || maxProfit <= 0) {
    throw new CannotPerformStockAnalysisError();
  }

  return { buy: bestBuy, sell: bestSell };
}
