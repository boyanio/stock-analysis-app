import express, { Router } from "express";
import { IStockAnalysisRepository } from "./stock-analysis.repository";
import { parseTimestamp } from "../util/validation.util";
import {
  STATUS_BAD_REQUEST,
  STATUS_CONFLICT,
} from "../util/http-status-codes.util";
import { SharePrice, SharePriceStats } from "./stock-analysis.models";

export function stockAnalysisRouter(
  repository: IStockAnalysisRepository
): Router {
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

    const records = repository.getRecords({ startTime, endTime });
    if (!records.length) {
      return res
        .status(STATUS_BAD_REQUEST)
        .send({ error: "No records matching the given time range." });
    }

    const [buyIndex, sellIndex] = findBestBuySellIndexes(records);
    if (buyIndex < 0 || sellIndex < 0) {
      return res
        .status(STATUS_CONFLICT)
        .send({ error: "Cannot determine optimal buy & sell points." });
    }

    const stats: SharePriceStats = {
      buy: records[buyIndex],
      sell: records[sellIndex],
    };
    return res.json(stats);
  });

  return router;
}

function findBestBuySellIndexes(records: SharePrice[]): [number, number] {
  let minIndex = 0;
  let maxDiff = -Infinity;
  let result: [number, number] = [-1, -1];

  for (let i = 1; i < records.length; i++) {
    let diff = records[i].price - records[minIndex].price;
    if (diff >= maxDiff) {
      maxDiff = diff;
      result = [minIndex, i];
    }

    if (diff < 0) {
      minIndex = i;
    }
  }

  return maxDiff > 0 ? result : [-1, -1];
}
