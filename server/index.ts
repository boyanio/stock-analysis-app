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
const MIN_DATE = new Date("2024-04-30T21:00:00Z");
const MAX_DATE = new Date("2024-10-31T21:59:59Z");
const stockAnalysisRepository = new RollingFileStockAnalysisRepository({
  minTimestamp: MIN_DATE.getTime(),
  maxTimestamp: MAX_DATE.getTime(),
});
const ONE_HOUR_IN_SECS = 60 * 60;
app.use(
  "/api/stock-analysis",
  requireJwtToken,
  stockAnalysisRouter(stockAnalysisRepository, {
    batchSizeInSecs: ONE_HOUR_IN_SECS,
  })
);

app.listen(PORT, () =>
  console.log(
    `Listening on http://localhost:${PORT}\n\nSupported time range for queries:\n[\n\t${MIN_DATE}\n\t${MAX_DATE}\n]`
  )
);
