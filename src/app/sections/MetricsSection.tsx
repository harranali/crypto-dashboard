"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Type for global stats
interface GlobalStats {
  totalMarketCap: number;
  marketCapChange24h: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  updatedAt: number;
}

// Fetch function
async function fetchGlobalStats(): Promise<GlobalStats | null> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global");
    if (!res.ok) throw new Error("Failed to fetch global stats");
    const data = await res.json();

    return {
      totalMarketCap: data.data.total_market_cap.usd,
      marketCapChange24h: data.data.market_cap_change_percentage_24h_usd,
      totalVolume24h: data.data.total_volume.usd,
      btcDominance: data.data.market_cap_percentage.btc,
      ethDominance: data.data.market_cap_percentage.eth,
      updatedAt: data.data.updated_at,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Component
export default function GlobalMetrics() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGlobalStats()
      .then((data) => {
        if (data) setStats(data);
        else setError("Failed to fetch stats");
      })
      .catch(() => setError("Failed to fetch stats"))
      .finally(() => setLoading(false));
  }, []);

  const formatUSD = (value: number) =>
    `$${(value / 1_000_000_000).toFixed(2)}B`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Market Cap */}
      <Card>
        <CardHeader>
          <CardTitle>Total Market Cap</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : error || !stats ? (
            <span className="text-red-500">Error</span>
          ) : (
            <div>
              <span className="font-bold">{formatUSD(stats.totalMarketCap)}</span>
              <span
                className={`ml-2 font-medium ${
                  stats.marketCapChange24h >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stats.marketCapChange24h >= 0 ? "+" : ""}
                {stats.marketCapChange24h.toFixed(2)}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 24h Volume */}
      <Card>
        <CardHeader>
          <CardTitle>24h Volume</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-6 w-24" />
          ) : error || !stats ? (
            <span className="text-red-500">Error</span>
          ) : (
            <span className="font-bold">{formatUSD(stats.totalVolume24h)}</span>
          )}
        </CardContent>
      </Card>

      {/* BTC Dominance */}
      <Card>
        <CardHeader>
          <CardTitle>BTC Dominance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : error || !stats ? (
            <span className="text-red-500">Error</span>
          ) : (
            <span className="font-bold">{stats.btcDominance.toFixed(1)}%</span>
          )}
        </CardContent>
      </Card>

      {/* ETH Dominance */}
      <Card>
        <CardHeader>
          <CardTitle>ETH Dominance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : error || !stats ? (
            <span className="text-red-500">Error</span>
          ) : (
            <span className="font-bold">{stats.ethDominance.toFixed(1)}%</span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
