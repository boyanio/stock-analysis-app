import React, { useState } from "react";
import "./App.css";
import StockAnalysis from "./StockAnalysis";
import { SharePriceStats as SharePriceStatsModel } from "../server/stock-analysis/stock-analysis.models";
import SharePriceStats from "./SharePriceStats";
import ProfitCheck from "./ProfitCheck";

export default function App() {
  const [stats, setStats] = useState<SharePriceStatsModel | null>(null);

  function handleStats(stats: SharePriceStatsModel | null) {
    setStats(stats);
  }

  return (
    <main>
      <h1>Stock analysis</h1>
      <StockAnalysis onStats={handleStats} />
      {stats && <SharePriceStats stats={stats} />}
      {stats && <ProfitCheck stats={stats} />}
    </main>
  );
}
