import React from "react";
import "./SharePriceStats.css";
import dayjs from "dayjs";
import { SharePriceStats as SharePriceStatsModel } from "../server/stock-analysis/stock-analysis.models";
import Money from "./Money";

type Props = {
  stats: SharePriceStatsModel;
};

export default function SharePriceStats({ stats }: Props) {
  return (
    <div className="SharePriceStats-layout">
      <div>
        <span className="format">BUY</span> on 🗓️
        <span className="format">
          {formatTime(stats.buy.timestamp)}
        </span> for <Money value={stats.buy.price} />
      </div>
      <div>
        <span className="format">SELL</span> on 🗓️
        <span className="format">
          {formatTime(stats.sell.timestamp)}
        </span> for <Money value={stats.sell.price} />
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  return dayjs(timestamp).format("DD-MMM-YYYY HH:mm:ss");
}
