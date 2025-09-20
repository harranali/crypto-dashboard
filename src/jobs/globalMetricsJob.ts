import db from "@/lib/db";
import { insertOrUpdateGlobalMetrics } from "@/lib/db/globalMetrics";

// Helper to fetch from CoinGecko
async function fetchGlobalMetrics() {
  const res = await fetch("https://api.coingecko.com/api/v3/global");
  if (!res.ok) throw new Error("Failed to fetch global metrics from CoinGecko");

  const data = await res.json();
  const marketData = data.data;

  const metrics = {
    total_market_cap: marketData.total_market_cap.usd || 0,
    total_volume: marketData.total_volume.usd || 0,
    btc_dominance: marketData.market_cap_percentage.btc || 0,
    eth_dominance: marketData.market_cap_percentage.eth || 0,
    market_cap_change_24h: marketData.market_cap_change_percentage_24h_usd || 0,
    extra: JSON.stringify({
      active_cryptocurrencies: marketData.active_cryptocurrencies,
      markets: marketData.markets,
      ongoing_icos: marketData.ongoing_icos,
      ended_icos: marketData.ended_icos,
    }),
    last_updated: new Date().toISOString(),
    last_fetched: new Date().toISOString(),
  };

  insertOrUpdateGlobalMetrics(metrics);
  console.log("✅ Global metrics updated at", new Date().toISOString());
}

export function startGlobalMetricsJob() {
  // Run immediately at startup
  fetchGlobalMetrics().catch((err) => console.error("Initial global metrics fetch failed:", err));

  // Then run every 30 seconds
  setInterval(() => {
    fetchGlobalMetrics().catch((err) => console.error("Global metrics fetch failed:", err));
  }, 30 * 1000);
}
