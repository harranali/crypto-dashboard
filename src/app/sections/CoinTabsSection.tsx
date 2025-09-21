"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import CoinSheet from "@/app/components/CoinSheet";
import CoinTableRowSkeleton from "@/app/components/CoinTableRowSkeleton"; // New skeleton component
import { Search, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";


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
      if (!res.ok) throw new Error("Failed to fetch coins");
      const data = await res.json();
      setTabData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], coins: data.coins || [] },
      }));
    } catch (err: any) {
      console.error(err);
      setTabData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], error: err.message || "Failed to fetch coins" },
      }));
    } finally {
      setTabData((prev) => ({ ...prev, [tab]: { ...prev[tab], loading: false } }));
    }
  };

  const refreshTabCoins = async (tab: TabType) => {
    setTabData((prev) => ({ ...prev, [tab]: { ...prev[tab], refreshing: true, error: null } }));
    try {
      const res = await fetch(`/api/${tab}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to refresh data");
      await fetchTabCoins(tab);
    } catch (err: any) {
      console.error(err);
      setTabData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], error: err.message || "Failed to refresh data" },
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
      {/* Tabs */}
      <div className="flex items-center justify-between border-b pb-2 mb-2">
      <div className="flex space-x-4">
        {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative py-2 px-4 text-lg font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              activeTab === tab
                ? "text-blue-600 bg-blue-50 after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:rounded after:bg-blue-600"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            {TAB_LABELS[tab]}
            {activeTab === tab && tabData[tab].coins.length > 0 && tabData[tab].coins[0].updated_at_formatted && (
              <span className="ml-2 text-xs text-gray-400">
                updated {tabData[tab].coins[0].updated_at_formatted}
              </span>
            )}
          </button>
        ))}
      </div>


        {/* Refresh */}
        <button
          onClick={() => refreshTabCoins(activeTab)}
          disabled={tabData[activeTab].refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          title="Refresh tab data"
        >
          {tabData[activeTab].refreshing && (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          )}
          {tabData[activeTab].refreshing ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* Search */}
      <div className="flex items-center mb-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-lg text-sm md:text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
          aria-label="Search coins"
        />
        {search && (
          <button onClick={() => setSearch("")} className="ml-2 text-gray-500 hover:text-gray-700 transition">
            ✕
          </button>
        )}
      </div>


      {/* Error */}
      {tabData[activeTab].error && (
        <p className="text-red-500 text-sm mb-2">{tabData[activeTab].error}</p>
      )}

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
            <thead className="text-gray-500 text-xs uppercase tracking-wider">
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
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCoin(coin)}
                >
                  <td className="py-3 px-4 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 flex items-center space-x-2">
                    <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold">${coin.current_price?.toLocaleString()}</td>
                  <td
                    className={`py-3 px-4 font-medium ${
                      coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-gray-600">${formatLargeNumber(coin.market_cap)}</td>
                  <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">
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
        coinId={selectedCoin.id} // pass id instead of full coinData
        setCoin={(coinName) => !coinName && setSelectedCoin(null)}
      />
      )}
    </Card>
  );
}