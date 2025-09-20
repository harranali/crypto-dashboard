"use client";

import { MetricCard } from "./MetricCard";
import { CoinData } from "@/types";

interface MetricsGridProps {
  coinData: CoinData;
}

export function MetricsGrid({ coinData }: MetricsGridProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Price & Performance Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="7d Change"
          value={coinData.extra?.sevenDayChange}
          type="percent"
          tooltipContent="Percentage change in price over the last 7 days."
        />
        <MetricCard
          label="Momentum"
          value={coinData.extra?.momentum}
          type="string"
          tooltipContent="The directional trend of the coin's price over the past 7 days (Bullish, Bearish, or Neutral)."
        />
        <MetricCard
          label="% to ATH"
          value={coinData.extra?.percentToATH}
          type="percent"
          tooltipContent="The percentage difference between the current price and the all-time high price."
        />
        <MetricCard
          label="Volatility"
          value={coinData.extra?.volatility}
          type="dollar"
          tooltipContent="A measure of how much the price has fluctuated in the past 7 days."
        />
        <MetricCard
          label="7d MA"
          value={coinData.extra?.ma7}
          type="dollar"
          tooltipContent="The 7-day Moving Average price."
        />
      </div>

      {/* Market Data Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="Market Cap"
          value={coinData.marketCap}
          type="dollar"
          tooltipContent="The total value of a cryptocurrency's circulating supply."
        />
        <MetricCard
          label="Volume (24h)"
          value={coinData.volume}
          type="dollar"
          tooltipContent="The total value of a cryptocurrency's trading volume in the last 24 hours."
        />
        <MetricCard
          label="P/MC"
          value={coinData.extra?.priceToMarketCap}
          type="ratio"
          tooltipContent="Price to Market Cap Ratio: Compares the coin's price to its total market capitalization."
        />
        <MetricCard
          label="P/V"
          value={coinData.extra?.priceToVolume}
          type="ratio"
          tooltipContent="Price to Volume Ratio: Compares the coin's price to its daily trading volume."
        />
      </div>

      {/* Supply Data Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="Circulating Supply"
          value={coinData.supply}
          type="string"
          tooltipContent="The number of coins that are currently available to the public."
        />
        <MetricCard
          label="Max Supply"
          value={coinData.maxSupply}
          type="string"
          tooltipContent="The maximum number of coins that will ever exist in the lifetime of the cryptocurrency."
        />
        <MetricCard
          label="% Circulating"
          value={coinData.extra?.circulatingPercent}
          type="percent"
          tooltipContent="The percentage of the total supply that is currently in circulation."
        />
      </div>
    </div>
  );
}
