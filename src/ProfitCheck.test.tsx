import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ProfitCheck from "./ProfitCheck";
import { SharePriceStats } from "../server/stock-analysis/stock-analysis.models";

it("calculates profit", async () => {
  const stats: SharePriceStats = {
    buy: { timestamp: 1, price: 10.03 },
    sell: { timestamp: 2, price: 34.12 },
  };
  render(<ProfitCheck stats={stats} />);

  const input = screen.getByLabelText("Money");
  await userEvent.type(input, "125");

  const button = screen.getByRole("button", { name: "Check" });
  fireEvent.click(button);

  expect(screen.getByText("You could have earnt 💰")).toBeInTheDocument();
  expect(screen.getByText("289.08")).toBeInTheDocument();
});
