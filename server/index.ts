import express from "express";
import cors from "cors";
import { stockAnalysisRouter } from "./stock-analysis/stock-analysis.router";
import { InMemoryStockAnalysisRepository } from "./stock-analysis/in-memory-stock-analysis.repository";
import stockPriceHistory from "./stock-analysis/stock-price-history.json";

const PORT = 8080;

const app = express();

app.use(cors());

// NOTE: Switch to real database repository, if necessary
const stockAnalysisRepository = new InMemoryStockAnalysisRepository(
  stockPriceHistory
);
app.use("/api/stock-analysis", stockAnalysisRouter(stockAnalysisRepository));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
