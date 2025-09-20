"use client";

import { MetricCard } from "./MetricCard";
import { CoinData } from "@/types"; // We'll create a type file if not already present
import { cn } from "@/lib/utils";

interface MetricsGridProps {
  coinData: CoinData;
}

export function MetricsGrid({ coinData }: MetricsGridProps) {
  const mergedData = coinData;

  return (
    <div className="flex flex-col gap-6">
      {/* Price & Performance Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="7d Change"
          value={
            mergedData.extra?.sevenDayChange != null
              ? mergedData.extra.sevenDayChange.toFixed(2) + "%"
              : "N/A"
          }
          tooltipContent="Percentage change in price over the last 7 days."
        />
        <MetricCard
          label="Momentum"
          value={mergedData.extra?.momentum}
          tooltipContent="The directional trend of the coin's price over the past 7 days (Bullish, Bearish, or Neutral)."
        />
        <MetricCard
          label="% to ATH"
          value={
            mergedData.extra?.percentToATH != null
              ? mergedData.extra.percentToATH.toFixed(2) + "%"
              : "N/A"
          }
          tooltipContent="The percentage difference between the current price and the all-time high price."
        />
        <MetricCard
          label="Volatility"
          value={mergedData.extra?.volatility ? `$${mergedData.extra.volatility.toFixed(4)}` : "N/A"}
          tooltipContent="A measure of how much the price has fluctuated in the past 7 days."
        />
        <MetricCard
          label="7d MA"
          value={mergedData.extra?.ma7?.toLocaleString()}
          tooltipContent="The 7-day Moving Average price."
        />
      </div>

      {/* Market Data Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="Market Cap"
          value={mergedData.marketCap ? `$${Number(mergedData.marketCap).toLocaleString()}` : "N/A"}
          tooltipContent="The total value of a cryptocurrency's circulating supply."
        />
        <MetricCard
          label="Volume (24h)"
          value={mergedData.volume}
          tooltipContent="The total value of a cryptocurrency's trading volume in the last 24 hours."
        />
        <MetricCard
          label="P/MC"
          value={mergedData.extra?.priceToMarketCap?.toFixed(8)}
          tooltipContent="Price to Market Cap Ratio: Compares the coin's price to its total market capitalization. A lower number may suggest a lower valuation."
        />
        <MetricCard
          label="P/V"
          value={mergedData.extra?.priceToVolume?.toFixed(6)}
          tooltipContent="Price to Volume Ratio: Compares the coin's price to its daily trading volume. A lower number may indicate higher trading activity relative to its price."
        />
      </div>

      {/* Supply Data Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="Circulating Supply"
          value={mergedData.supply}
          tooltipContent="The number of coins that are currently available to the public."
        />
        <MetricCard
          label="Max Supply"
          value={mergedData.maxSupply}
          tooltipContent="The maximum number of coins that will ever exist in the lifetime of the cryptocurrency."
        />
        <MetricCard
          label="% Circulating"
          value={mergedData.extra?.circulatingPercent?.toFixed(2) + "%"}
          tooltipContent="The percentage of the total supply that is currently in circulation."
        />
      </div>
    </div>
  );
}
