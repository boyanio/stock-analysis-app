import express from "express";
import cors from "cors";
import { stockAnalysisRouter } from "./stock-analysis/stock-analysis.router";
import { authRouter } from "./auth/auth.router";
import { requireJwtToken } from "./middleware/auth";
import morgan from "morgan";
import { RollingFileStockAnalysisRepository } from "./stock-analysis/rolling-file-stock-analysis.repository";

const PORT = 8080;

const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(morgan("combined"));

// NOTE: Use a more reputable auth provider (e.g., Auth0)
app.use("/api/auth", authRouter);

// NOTE: Switch to a real database repository
const stockAnalysisRepository = new RollingFileStockAnalysisRepository({
  minTimestamp: new Date("2024-05-01T00:00:00").getTime(),
  maxTimestamp: new Date("2024-10-31T23:59:59").getTime(),
});
const batchSizeInSecs = 60 * 60; // 1 hour
app.use(
  "/api/stock-analysis",
  requireJwtToken,
  stockAnalysisRouter(stockAnalysisRepository, { batchSizeInSecs })
);

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
