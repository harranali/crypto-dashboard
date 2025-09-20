"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface ChartSectionProps {
  chartData: number[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ChartSection({ chartData, loading, error, onRetry }: ChartSectionProps) {
  const [timeRange, setTimeRange] = useState<"24h" | "7d">("7d");

  const data = (() => {
    if (!chartData || !chartData.length) return [];

    let points: number[];
    if (timeRange === "24h") {
      points = chartData.slice(-24); // last 24 points
    } else {
      points = chartData; // full 7d
    }

    const now = Date.now();
    const intervalMs = timeRange === "24h" ? 60 * 60 * 1000 : (7 * 24 * 60 * 60 * 1000) / chartData.length;

    return points.map((price, idx) => {
      const timestamp = now - (points.length - 1 - idx) * intervalMs;
      const date = new Date(timestamp);

      return {
        time: date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        price,
      };
    });
  })();

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <p className="text-lg font-medium">Price Chart</p>
        <div className="space-x-2">
          {["24h", "7d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as "24h" | "7d")}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full transition-colors",
                timeRange === range ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-80 bg-white shadow-md rounded-lg p-2 flex items-center justify-center">
        {loading ? (
          <p className="text-gray-400">Loading chart...</p>
        ) : error ? (
          <div className="text-center space-y-2">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={onRetry}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Retry
            </button>
          </div>
        ) : data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="#bfdbfe" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">No chart data available</p>
        )}
      </div>
    </div>
  );
}
