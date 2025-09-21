"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

interface GlobalMetricsData {
  total_market_cap: number;
  total_volume: number;
  btc_dominance: number;
  eth_dominance: number;
  market_cap_change_24h: number;
  last_updated: string;
  last_updated_formatted: string;
}

export default function GlobalMetrics() {
  const [metrics, setMetrics] = useState<GlobalMetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/global-metrics", {
        method: forceRefresh ? "POST" : "GET", // Use POST for refresh, GET for initial load
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Rate limit exceeded. Please try again after 30-60 seconds.");
        }
        throw new Error("Failed to fetch global metrics. Please try again.");
      }
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(); // Initial fetch on component mount
  }, []);

  const handleRefresh = () => {
    fetchMetrics(true); // Call fetch function with forceRefresh = true
  };

  const formatNumber = (num?: number) => {
    if (num == null) return "-";
    return num >= 1e12
      ? `$${(num / 1e12).toFixed(2)}T`
      : num >= 1e9
      ? `$${(num / 1e9).toFixed(2)}B`
      : num >= 1e6
      ? `$${(num / 1e6).toFixed(2)}M`
      : `$${num.toLocaleString()}`;
  };

  const formatPercent = (num?: number) => {
    if (num == null) return "-";
    return `${num > 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const showSkeleton = loading || !metrics;

  const ChangeIcon =
    metrics?.market_cap_change_24h != null ? (
      metrics.market_cap_change_24h >= 0 ? (
        <ArrowUp size={16} />
      ) : (
        <ArrowDown size={16} />
      )
    ) : null;

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Global Metrics</h2>
        <Button onClick={handleRefresh} disabled={loading} aria-label="Refresh global metrics">
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <p className="text-[--color-brand-red] text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        {/* Total Market Cap */}
        <div>
          <p className="text-[--color-brand-gray]">Total Market Cap</p>
          {showSkeleton ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <>
              <p className="text-2xl font-semibold">
                {formatNumber(metrics?.total_market_cap)}
              </p>
              <div
                className={`flex items-center gap-1 text-sm mt-1 ${
                  metrics?.market_cap_change_24h != null
                    ? metrics.market_cap_change_24h >= 0
                      ? "text-[--color-brand-green]"
                      : "text-[--color-brand-red]"
                    : "text-[--color-brand-gray]"
                }`}
              >
                {ChangeIcon}
                <span>{formatPercent(metrics?.market_cap_change_24h)}</span>
              </div>
            </>
          )}
        </div>

        {/* 24h Volume */}
        <div>
          <p className="text-[--color-brand-gray]">24h Volume</p>
          {showSkeleton ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-2xl font-semibold">
              {formatNumber(metrics?.total_volume)}
            </p>
          )}
        </div>

        {/* BTC Dominance */}
        <div>
          <p className="text-[--color-brand-gray]">BTC Dominance</p>
          {showSkeleton ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-semibold">
              {metrics?.btc_dominance.toFixed(1)}%
            </p>
          )}
        </div>

        {/* ETH Dominance */}
        <div>
          <p className="text-[--color-brand-gray]">ETH Dominance</p>
          {showSkeleton ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-semibold">
              {metrics?.eth_dominance.toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {!showSkeleton && metrics && (
        <p className="text-xs text-[--color-brand-gray] mt-6 text-right">
          Last updated: {metrics.last_updated_formatted}
        </p>
      )}
    </Card>
  );
}