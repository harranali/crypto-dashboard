"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/global-metrics");
      if (!res.ok) throw new Error("Failed to fetch global metrics");
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (err: any) {
      setError(err.message || "Error fetching metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

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

  // Show skeletons if loading OR metrics are not loaded yet
  const showSkeleton = loading || !metrics;

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Global Metrics</h2>
        <Button onClick={fetchMetrics} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
        {/* Total Market Cap */}
        <div>
          <p className="text-gray-500">Total Market Cap</p>
          {showSkeleton ? <Skeleton className="h-8 w-32" /> : <p className="text-2xl font-semibold">{formatNumber(metrics?.total_market_cap)}</p>}
          {showSkeleton ? <Skeleton className="h-4 w-12 mt-1" /> : (
            <p
              className={`text-sm mt-1 ${
                metrics?.market_cap_change_24h != null
                  ? metrics.market_cap_change_24h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                  : "text-gray-400"
              }`}
            >
              {formatPercent(metrics?.market_cap_change_24h)}
            </p>
          )}
        </div>

        {/* 24h Volume */}
        <div>
          <p className="text-gray-500">24h Volume</p>
          {showSkeleton ? <Skeleton className="h-8 w-32" /> : <p className="text-2xl font-semibold">{formatNumber(metrics?.total_volume)}</p>}
        </div>

        {/* BTC Dominance */}
        <div>
          <p className="text-gray-500">BTC Dominance</p>
          {showSkeleton ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-semibold">{metrics?.btc_dominance.toFixed(1)}%</p>}
        </div>

        {/* ETH Dominance */}
        <div>
          <p className="text-gray-500">ETH Dominance</p>
          {showSkeleton ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-semibold">{metrics?.eth_dominance.toFixed(1)}%</p>}
        </div>
      </div>

      {!showSkeleton && metrics && (
        <p className="text-xs text-gray-400 mt-2">Last updated: {metrics.last_updated_formatted}</p>
      )}
    </Card>
  );
}
