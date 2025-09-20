"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CircleArrowUp, CircleArrowDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChartSection } from "@/app/sections/ChartSection";
import { AboutSection } from "@/app/components/AboutSection";
import { MetricsGrid } from "@/app/components/MetricsGrid";
import { Button } from "@/components/ui/button";

interface CoinData {
  id: string;
  symbol?: string;
  price?: string;
  change?: string;
  isUp?: boolean;
  marketCap?: string;
  volume?: string;
  supply?: string;
  maxSupply?: string;
  image?: string;
  extra?: {
    sevenDayChange?: number;
    volatility?: number;
    ma7?: number;
    priceToMarketCap?: number | null;
    priceToVolume?: number | null;
    momentum?: string;
    percentToATH?: number;
    circulatingPercent?: number;
    volume7dChange?: number;
    lastFetched?: string;
    lastFetchedFormatted?: string;
  };
}

interface ExtraDetails {
  allTimeHigh?: string;
  allTimeLow?: string;
  rank?: string;
  rankChange24h?: number;
  devScore?: string;
  description?: string;
  website?: string;
  twitter?: string;
  reddit?: string;
}

interface CoinSheetProps {
  coinName: string | null;
  coinId: string | null;
  setCoin: (coin: string | null) => void;
}

export default function CoinSheet({ coinName, coinId, setCoin }: CoinSheetProps) {
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  const [extraDetails, setExtraDetails] = useState<ExtraDetails>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch coin data (GET)
  const fetchCoinData = async () => {
    if (!coinId) return;

    setLoading(true);
    setError(null);
    setCoinData(null); // clear previous data to show loading placeholder

    try {
      const res = await fetch(`/api/coin/${coinId}`);
      const result = await res.json();

      if (res.ok) {
        setCoinData(result.coinData);
        setChartData(result.sparkline || []);
        setExtraDetails(result.coinData.extra || {});
      } else {
        setError(result.error || "Failed to fetch coin data");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch coin data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch whenever coinId changes
  useEffect(() => {
    fetchCoinData();
  }, [coinId]);

  // Refresh handler (POST request)
  const handleRefresh = async () => {
    if (!coinId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/coin/${coinId}`, { method: "POST" });
      const result = await res.json();

      if (res.ok) {
        setCoinData(result.coinData);
        setChartData(result.sparkline || []);
        setExtraDetails(result.coinData.extra || {});
      } else {
        setError(result.error || "Failed to refresh coin data.");
      }
    } catch (err) {
      console.error("Failed to refresh coin data", err);
      setError("Failed to refresh coin data.");
    } finally {
      setLoading(false);
    }
  };

  // Compute last fetched and outdated status
  const lastFetched = coinData?.extra?.lastFetched ? new Date(coinData.extra.lastFetched) : null;
  const isOutdated = !lastFetched || Date.now() - lastFetched.getTime() > 5 * 60 * 1000; // 5 min
  const lastFetchedFormatted =
    coinData?.extra?.lastFetchedFormatted ||
    (lastFetched ? `${Math.floor((Date.now() - lastFetched.getTime()) / 1000)}s ago` : null);

  return (
    <Sheet open={!!coinName} onOpenChange={(open) => !open && setCoin(null)}>
      <SheetContent
        side="right"
        className="overflow-y-auto p-6 flex flex-col h-screen max-w-lg sm:max-w-xl md:max-w-2xl"
      >
        <SheetHeader className="flex flex-col gap-2 mb-4 p-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {coinData?.image && (
                <img src={coinData.image} alt={coinName || "Coin"} className="w-12 h-12 rounded-full" />
              )}
              <div className="flex flex-col">
                <SheetTitle className="text-3xl font-bold flex items-center gap-2">
                  {coinName || "Coin Details"}
                  {loading && <span className="ml-2 text-sm text-gray-400 animate-pulse">Loading...</span>}
                  <span className="text-sm font-normal text-gray-500 uppercase">({coinData?.symbol})</span>
                </SheetTitle>
                {coinData && (
                  <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                    {coinData.price}
                    <span
                      className={cn(
                        "text-sm font-semibold flex items-center gap-1",
                        coinData.isUp ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {coinData.isUp ? <CircleArrowUp size={16} /> : <CircleArrowDown size={16} />}
                      {coinData.change}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={cn("h-5 w-5", loading && "animate-spin text-blue-500")} />
              </Button>
              {isOutdated ? (
                <span className="text-red-500 text-xs">
                  Outdated (last updated more than 5 minutes ago). Click to refresh.
                </span>
              ) : lastFetchedFormatted ? (
                <span className="text-gray-500 text-xs">Updated {lastFetchedFormatted}</span>
              ) : null}
            </div>
          </div>
        </SheetHeader>

        {/* Main content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400 text-lg animate-pulse">Loading coin data...</p>
          </div>
        ) : coinData ? (
          <div className="flex flex-col gap-6">
            <MetricsGrid coinData={coinData} />

            <ChartSection chartData={chartData} loading={loading} error={error} onRetry={handleRefresh} />

            <AboutSection extraDetails={extraDetails} />
          </div>
        ) : (
          <p className="text-gray-400 mt-4">Select a coin to see details</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
