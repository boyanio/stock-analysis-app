import React, { useState } from "react";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { SharePriceStats } from "../server/stock-analysis/stock-analysis.models";
import ErrorMessage from "./ErrorMessage";
import { useAuth } from "./hooks/auth";

type StockAnalysisProps = {
  onStats(stats: SharePriceStats | null): void;
};

const referenceData = dayjs("2024-09-30");
const STATS_GENERIC_ERROR =
  "We cannot analyze the stock prices at the moment. Please, try again shortly.";

export default function StockAnalysis({ onStats }: StockAnalysisProps) {
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsErr, setStatsError] = useState("");
  const { token } = useAuth();

  async function handleAnalyzeClick() {
    setStatsLoading(true);
    onStats(null);

    const start = startTime!.toDate().getTime();
    const end = endTime!.toDate().getTime();
    try {
      const response = await fetch(
        `/api/stock-analysis?startTime=${start}&endTime=${end}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStatsLoading(false);

      if (!response.ok) {
        if (response.status === 400 || response.status === 409) {
          const body = (await response.json()) as { error: string };
          setStatsError(body.error);
        } else {
          setStatsError(STATS_GENERIC_ERROR);
        }
        return;
      }

      const body = await response.json();
      onStats(body);
    } catch (error) {
      setStatsLoading(false);
      setStatsError(STATS_GENERIC_ERROR);
    }
  }

  function handleStartTimeChange(value: dayjs.Dayjs | null) {
    setStartTime(value);
    setStatsError("");
  }

  function handleEndTimeChange(value: dayjs.Dayjs | null) {
    setEndTime(value);
    setStatsError("");
  }

  const canAnalyze =
    !!startTime && !!endTime && endTime.isAfter(startTime) && !statsLoading;
  const showTimeError =
    !!startTime && !!endTime && !endTime.isAfter(startTime) && !statsLoading;
  const err =
    statsErr ||
    (showTimeError ? "You must enter valid start & end times." : "");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <h2>Analyze the best time to buy & sell</h2>

      <div className="form-outer">
        <div className="form-inner">
          <MobileTimePicker
            label={"Start time"}
            views={["hours", "minutes", "seconds"]}
            format="HH:mm:ss"
            ampm={false}
            disabled={statsLoading}
            referenceDate={referenceData}
            onAccept={handleStartTimeChange}
            defaultValue={startTime}
          />

          <MobileTimePicker
            label={"End time"}
            views={["hours", "minutes", "seconds"]}
            format="HH:mm:ss"
            ampm={false}
            disabled={statsLoading}
            referenceDate={referenceData}
            onAccept={handleEndTimeChange}
            defaultValue={endTime}
          />

          <button
            type="button"
            disabled={!canAnalyze}
            onClick={handleAnalyzeClick}
          >
            Analyze
          </button>
        </div>
        {err && <ErrorMessage error={err} />}
      </div>
    </LocalizationProvider>
  );
}
