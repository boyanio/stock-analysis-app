import React, { useRef, useState } from "react";
import "./ProfitCheck.css";
import { SharePriceStats } from "../server/stock-analysis/stock-analysis.models";
import ErrorMessage from "./ErrorMessage";
import Money from "./Money";

type Props = {
  stats: SharePriceStats;
};

export default function ProfitCheck({ stats }: Props) {
  const [profit, setProfit] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCheckClick() {
    setProfit(0);

    const inputValue = inputRef.current?.value;
    if (!inputValue) {
      setError("You should enter the desired amount to invest.");
      return;
    }

    const money = parseInt(inputValue, 10);
    if (isNaN(money) || money <= 0) {
      setError("You should enter a valid amount.");
      return;
    }

    setError("");

    const numberOfSharesToBuy = Math.floor(money / stats.buy.price);
    if (numberOfSharesToBuy === 0) {
      setError("You should enter an amount for at least one share.");
      return;
    }

    const profit = numberOfSharesToBuy * (stats.sell.price - stats.buy.price);
    setProfit(profit);
  }

  return (
    <>
      <h2>Check how much you could have earned by investing</h2>

      <div className="form-outer">
        <div className="form-inner">
          💰
          <input type="number" min={0} ref={inputRef} aria-label="Money" />
          <button type="button" className="action" onClick={handleCheckClick}>
            Check
          </button>
        </div>
        {error && <ErrorMessage error={error} />}
        {profit > 0 && (
          <div className="profit">
            You could have earned <Money value={profit} />
          </div>
        )}
      </div>
    </>
  );
}
