"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CircleArrowUp, CircleArrowDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChartSection } from "@/app/sections/ChartSection";
import { AboutSection } from "@/app/components/AboutSection";
import { MetricsGrid } from "@/app/components/MetricsGrid";
import { Button } from "@/components/ui/button";
import type { ParsedCoin } from "@/types/coin";

interface ExtraDetails {
  all_time_high?: string;
  all_time_low?: string;
  rank?: string;
  dev_score?: string;
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
  const [coinData, setCoinData] = useState<ParsedCoin | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  const [extraDetails, setExtraDetails] = useState<ExtraDetails>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const computeDerivedFields = (coin: ParsedCoin): ParsedCoin => ({
    ...coin,
    price_formatted: `$${coin.current_price.toLocaleString()}`,
    change_formatted: `${coin.price_change_percentage_24h.toFixed(2)}%`,
    is_up: coin.price_change_percentage_24h > 0,
  });

  const fetchCoin = async (method: "GET" | "POST" = "GET") => {
    if (!coinId) return;

    setLoading(true);
    setError(null);
    setCoinData(null);

    try {
      const res = await fetch(`/api/coin/${coinId}`, { method });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to fetch coin data");
        return;
      }

      const coin: ParsedCoin = computeDerivedFields(result.coin_data);
      setCoinData(coin);
      setChartData(result.coin_data.extra.sparkline || []);

      const extra = result.coin_data.extra || {};
      setExtraDetails({
        rank: extra.rank,
        all_time_high: extra.all_time_high,
        all_time_low: extra.all_time_low,
        dev_score: extra.dev_score,
        description: extra.description,
        website: extra.website,
        twitter: extra.twitter,
        reddit: extra.reddit,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch coin data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoin("GET");
  }, [coinId]);

  const handleRefresh = () => fetchCoin("POST");

  const lastFetched = coinData?.extra?.last_fetched ? new Date(coinData.extra.last_fetched) : null;
  const isOutdated = !lastFetched || Date.now() - lastFetched.getTime() > 5 * 60 * 1000;
  const lastFetchedFormatted =
    coinData?.extra?.last_fetched_formatted ||
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
                    {coinData.price_formatted}
                    <span
                      className={cn(
                        "text-sm font-semibold flex items-center gap-1",
                        coinData.is_up ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {coinData.is_up ? <CircleArrowUp size={16} /> : <CircleArrowDown size={16} />}
                      {coinData.change_formatted}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
            <Button 
              variant="outline" 
              size="sm"  // instead of "icon"
              onClick={handleRefresh} 
              disabled={loading}
              className="flex items-center gap-1 px-3"
            >
              <RefreshCw className={cn("h-5 w-5", loading && "animate-spin text-blue-500")} />
              Refresh
            </Button>
              {!loading && (
                isOutdated ? (
                  <span className="text-red-500 text-xs">
                    Outdated (last updated more than 5 minutes ago). Click to refresh.
                  </span>
                ) : lastFetchedFormatted ? (
                  <span className="text-gray-500 text-xs">Updated {lastFetchedFormatted}</span>
                ) : null
              )}
            </div>

          </div>
        </SheetHeader>

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
