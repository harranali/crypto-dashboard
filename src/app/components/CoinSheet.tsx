"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { CircleArrowUp, CircleArrowDown, Info, RefreshCw } from "lucide-react";
import { AboutSection } from "@/app/components/AboutSection";
import { MetricCard } from "@/app/components/MetricCard";
import { MetricsGrid } from "@/app/components/MetricsGrid";
import { ChartSection } from "@/app/sections/ChartSection";


// Assuming these components are available
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CoinData {
  id?: string;
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
  coinData: CoinData | undefined;
  setCoin: (coin: string | null) => void;
}





export default function CoinSheet({ coinName, coinData, setCoin }: CoinSheetProps) {
  const [chartData, setChartData] = useState<number[]>([]);
  const [extraDetails, setExtraDetails] = useState<ExtraDetails>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [coin, setCoinData] = useState<CoinData | null>(coinData ?? null);
  const [updatedData, setUpdatedData] = useState<CoinData | null>(null);


  const mapExtraToDetails = (extra: any): ExtraDetails => ({
    rank: extra.rank?.toString() || "N/A",
    allTimeHigh: extra.allTimeHigh ? `$${extra.allTimeHigh.toLocaleString()}` : "N/A",
    allTimeLow: extra.allTimeLow ? `$${extra.allTimeLow.toLocaleString()}` : "N/A",
    description: extra.description || "",
    website: extra.website || "",
    twitter: extra.twitter || "",
    reddit: extra.reddit || "",
    devScore: extra.devScore?.toString() || "N/A",
  });
  

  const handleRefresh = async () => {
    if (!coinData?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/coin/${coinData.id}`, {
        method: "POST",
      });
      const result = await res.json();

      if (res.ok) {
        // ✅ update coin with the fresh response
        setUpdatedData(result.coinData);
        setChartData(result.sparkline || []); // if you add sparkline in POST response
        setExtraDetails(mapExtraToDetails(result.coinData.extra || {}));

      } else {
        setError(result.error || "Failed to refresh data.");
      }
    } catch (err) {
      console.error("Failed to refresh coin", err);
      setError("Failed to refresh data.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!coinData?.id) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/coin/${coinData.id}`);
        const result = await res.json();

        if (res.ok) {
          setUpdatedData(result.coinData);
          setChartData(result.sparkline || []);
          setExtraDetails(result.extraDetails || {});
        } else {
          setError(result.error || "Failed to load data.");
        }
      } catch (err) {
        console.error("Failed to fetch coin details", err);
        setError("Failed to load data. Please try again in a few seconds.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [coinData?.id, reloadKey]);

  const mergedData = updatedData || coinData;

// Check if data is outdated
const lastFetched = mergedData?.extra?.lastFetched ? new Date(mergedData.extra.lastFetched) : null;
const isOutdated = !lastFetched || (Date.now() - lastFetched.getTime() > 5 * 60 * 1000); // 5 minutes

// Use formatted string if available
const lastFetchedFormatted = mergedData?.extra?.lastFetchedFormatted || (lastFetched ? `${Math.floor((Date.now() - lastFetched.getTime()) / 1000)}s ago` : null);


  return (
    <Sheet open={!!coinName} onOpenChange={(open) => !open && setCoin(null)}>
      <SheetContent
        side="right"
        className="overflow-y-auto p-6 flex flex-col h-screen max-w-lg sm:max-w-xl md:max-w-2xl"
      >

        <SheetHeader className="flex flex-col gap-2 mb-4 p-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {mergedData?.image && (
                <img
                  src={mergedData.image}
                  alt={coinName || "Coin"}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex flex-col">
                <SheetTitle className="text-3xl font-bold flex items-center gap-2">
                  {coinName || "Coin Details"}
                  <span className="text-sm font-normal text-gray-500 uppercase">
                    ({mergedData?.symbol})
                  </span>
                </SheetTitle>
                <div className="text-2xl font-bold mt-1 flex items-center gap-2">
                  {mergedData?.price}
                  <span className={cn("text-sm font-semibold", mergedData?.isUp ? "text-green-500" : "text-red-500")}>
                    {mergedData?.isUp ? <CircleArrowUp size={16} /> : <CircleArrowDown size={16} />}
                    {mergedData?.change}
                  </span>
                </div>
              </div>
            </div>

            {/* Refresh + Last Updated / Outdated */}
            <div className="flex flex-col items-end gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={cn("h-5 w-5", loading && "animate-spin text-blue-500")} />
              </Button>
              {isOutdated ? (
                <span className="text-red-500 text-xs">
                  Outdated (last updated more than 5 minutes ago). Click to refresh.
                </span>
              ) : lastFetchedFormatted ? (
                <span className="text-gray-500 text-xs">
                  Updated {lastFetchedFormatted}
                </span>
              ) : null}
            </div>
          </div>
        </SheetHeader>


        {mergedData ? (
          <div className="flex flex-col gap-6">
            <MetricsGrid coinData={mergedData} />

            {/* Chart */}
            <ChartSection
              chartData={chartData}
              loading={loading}
              error={error}
              onRetry={() => setReloadKey((k) => k + 1)}
            />

            {/* About & Community */}
            <AboutSection extraDetails={extraDetails} />

          </div>
        ) : (
          <p className="text-gray-400 mt-4">Select a coin to see details</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
