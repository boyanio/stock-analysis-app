import express from "express";
import cors from "cors";
import { stockAnalysisRouter } from "./stock-analysis/stock-analysis.router";
import { InMemoryStockAnalysisRepository } from "./stock-analysis/in-memory-stock-analysis.repository";
import stockPriceHistory from "./stock-analysis/stock-price-history.json";
import { authRouter } from "./auth/auth.router";
import { requireJwtToken } from "./middleware/auth";
import morgan from "morgan";

const PORT = 8080;

const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(morgan("combined"));

// NOTE: Use a more reputable auth provider (e.g., Auth0)
app.use("/api/auth", authRouter);

// NOTE: Switch to real database repository, if necessary
const stockAnalysisRepository = new InMemoryStockAnalysisRepository(
  stockPriceHistory
);
app.use(
  "/api/stock-analysis",
  requireJwtToken,
  stockAnalysisRouter(stockAnalysisRepository)
);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
