import React from "react";
import "./SharePriceStats.css";
import dayjs from "dayjs";
import { SharePriceStats as SharePriceStatsModel } from "../server/stock-analysis/stock-analysis.models";

type SharePriceStatsProps = {
  stats: SharePriceStatsModel;
};

export default function SharePriceStats({ stats }: SharePriceStatsProps) {
  return (
    <div className="SharePriceStats-layout">
      <div>
        <span className="format">BUY</span> on ⏰
        <span className="format">{formatTime(stats.buy.timestamp)}</span> at 💰
        <span className="format">{stats.buy.price}</span>
      </div>
      <div>
        <span className="format">SELL</span> on ⏰
        <span className="format">{formatTime(stats.sell.timestamp)}</span> at 💰
        <span className="format">{stats.sell.price}</span>
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  return dayjs(timestamp).format("HH:mm:ss");
}
