"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CoinSheet from "@/app/components/CoinSheet";
import CoinTableRowSkeleton from "@/app/components/CoinTableRowSkeleton";
import { RefreshCw } from "lucide-react";
import clsx from "clsx";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  extra?: {
    sevenDayChange?: number;
  };
  updated_at_formatted?: string;
}

type TabType = "top100" | "trending" | "gainers" | "losers";

const TAB_LABELS: Record<TabType, string> = {
  top100: "Top 100",
  trending: "Trending",
  gainers: "Gainers",
  losers: "Losers",
};

export default function CoinTabsSection() {
  const [activeTab, setActiveTab] = useState<TabType>("top100");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [search, setSearch] = useState("");

  const initialTabState = {
    coins: [] as Coin[],
    loading: true,
    refreshing: false,
    error: null as string | null,
  };

  const [tabData, setTabData] = useState<Record<TabType, typeof initialTabState>>({
    top100: { ...initialTabState },
    trending: { ...initialTabState },
    gainers: { ...initialTabState },
    losers: { ...initialTabState },
  });

  const fetchTabCoins = async (tab: TabType) => {
    setTabData((prev) => ({ ...prev, [tab]: { ...prev[tab], loading: true, error: null } }));
    try {
      const res = await fetch(`/api/${tab}`);
      
      if (!res.ok) {
        // Handle rate limit and other HTTP errors
        if (res.status === 429) {
          throw new Error("API rate limit exceeded. Please try again in 30-60 seconds.");
        }
        
        // Try to parse error response, fallback to generic message
        let errorMessage = "Failed to fetch coins";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status text or generic message
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      setTabData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], coins: data.coins || [] },
      }));
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch coins";
      setTabData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], error: errorMessage },
      }));
    } finally {
      setTabData((prev) => ({ ...prev, [tab]: { ...prev[tab], loading: false } }));
    }
  };

  const refreshTabCoins = async (tab: TabType) => {
    setTabData((prev) => ({ ...prev, [tab]: { ...prev[tab], refreshing: true, error: null } }));
    try {
      const res = await fetch(`/api/${tab}`, { method: "POST" });
      
      if (!res.ok) {
        // Handle rate limit and other HTTP errors
        if (res.status === 429) {
          throw new Error("API rate limit exceeded. Please try again in 30-60 seconds.");
        }
        
        // Try to parse error response, fallback to generic message
        let errorMessage = "Failed to refresh data";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If JSON parsing fails, use status text or generic message
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      await fetchTabCoins(tab);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh data";
      setTabData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], error: errorMessage },
      }));
    } finally {
      setTabData((prev) => ({ ...prev, [tab]: { ...prev[tab], refreshing: false } }));
    }
  };

  useEffect(() => {
    fetchTabCoins(activeTab);
  }, [activeTab]);

  const filteredCoins = tabData[activeTab].coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const formatLargeNumber = (num?: number) => {
    if (num == null) return "-";
    const suffixes = ["", "K", "M", "B", "T"];
    const numAbs = Math.abs(num);
    const tier = Math.floor(Math.log10(numAbs) / 3);
    if (tier < 0) return num.toLocaleString();
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;
    return `${scaled.toFixed(1)}${suffix}`;
  };

  return (
    <Card className="p-4">
      {/* Tabs and Refresh */}
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "relative py-1 px-2 text-base font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-[--color-ring]",
                "sm:py-2 sm:px-4 sm:text-lg",
                {
                  "font-bold after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:rounded after:bg-black":
                    activeTab === tab,
                  "text-[--color-foreground] hover:text-black": activeTab !== tab,
                }
              )}
            >
              {TAB_LABELS[tab]}
              {activeTab === tab && tabData[tab].coins.length > 0 && tabData[tab].coins[0].updated_at_formatted && (
                <span className="ml-2 text-xs text-[--color-muted-foreground] hidden md:inline">
                  updated {tabData[tab].coins[0].updated_at_formatted}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Refresh button and error message container */}
        <div className="flex flex-col items-end">
          <Button
            onClick={() => refreshTabCoins(activeTab)}
            disabled={tabData[activeTab].refreshing}
            aria-label="Refresh coin data"
          >
            {tabData[activeTab].refreshing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {tabData[activeTab].refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {tabData[activeTab].error && (
            <p className="text-red-500 text-xs mt-2 text-right w-full">
              {tabData[activeTab].error}
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center mb-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-lg text-sm md:text-base focus:ring-2 focus:ring-[--color-ring] focus:border-[--color-primary] transition-all"
          aria-label="Search coins"
        />
        {search && (
          <button onClick={() => setSearch("")} className="ml-2 text-[--color-muted-foreground] hover:text-[--color-foreground] transition">
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {tabData[activeTab].loading ? (
          <table className="w-full text-left min-w-[700px]">
            <tbody>
              {[...Array(10)].map((_, i) => (
                <CoinTableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left min-w-[700px]">
            <thead className="text-[--color-muted-foreground] text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Coin</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">24h %</th>
                <th className="py-3 px-4">Market Cap</th>
                <th className="py-3 px-4 hidden sm:table-cell">24h Volume</th>
                <th className="py-3 px-4 hidden sm:table-cell">7d %</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoins.map((coin, idx) => (
                <tr
                  key={coin.id}
                  className="border-b border-[--color-border] hover:bg-[--color-secondary] cursor-pointer transition-colors"
                  onClick={() => setSelectedCoin(coin)}
                >
                  <td className="py-3 px-4 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 flex items-center space-x-2">
                    <Image src={coin.image} alt={coin.name} width={20} height={20} className="w-5 h-5 rounded-full" />
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-[--color-muted-foreground] text-xs">{coin.symbol.toUpperCase()}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold">${coin.current_price?.toLocaleString()}</td>
                  <td
                    className={`py-3 px-4 font-medium ${
                      coin.price_change_percentage_24h > 0 ? "text-[--color-brand-green]" : "text-[--color-brand-red]"
                    }`}
                  >
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-[--color-muted-foreground]">${formatLargeNumber(coin.market_cap)}</td>
                  <td className="py-3 px-4 text-[--color-muted-foreground] hidden sm:table-cell">
                    ${formatLargeNumber(coin.total_volume)}
                  </td>
                  <td className="py-3 px-4 font-medium hidden sm:table-cell">
                    {coin.extra?.sevenDayChange?.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Coin Sheet */}
      {selectedCoin && (
        <CoinSheet
          coinName={selectedCoin.name}
          coinId={selectedCoin.id}
          setCoin={(coinName) => !coinName && setSelectedCoin(null)}
        />
      )}
    </Card>
  );
}