// This file is the backend API route for fetching and caching global crypto metrics.
// It uses a scheduled job to periodically fetch data from the CoinGecko API and
// stores the latest metrics in a local database (SQLite).

import { NextResponse } from "next/server";
// import { startGlobalMetricsJob } from "@/jobs/globalMetricsJob";
import db from '@/lib/db';
import { insertOrUpdateGlobalMetrics } from "@/lib/db/globalMetrics"; // Import the function

// // Start the job once per server instance
// // This will initiate the periodic fetching process in the background.
// startGlobalMetricsJob();
type GlobalMetricsRow = {
    id: number;
    total_market_cap: number;
    total_volume: number;
    btc_dominance: number;
    eth_dominance: number;
    market_cap_change_24h: number;
    extra: string;
    last_updated: string;
    last_fetched: string;
  };
  
// Helper: format relative time
function format_time_ago(dateStr?: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// -----------------------------------------------------------

/**
 * The core function to fetch data from the CoinGecko API and save it to the database.
 * This function now uses the imported `insertOrUpdateGlobalMetrics` function.
 */
async function fetchAndSaveGlobalMetrics() {
    console.log("Fetching new global metrics from API...");
    try {
        // Fetch data from CoinGecko API
        const api_res = await fetch("https://api.coingecko.com/api/v3/global");
        
        if (!api_res.ok) {
            if (api_res.status === 429) {
                throw new Error("RATE_LIMIT");
            }
            throw new Error("Failed to fetch data from external API.");
        }

        const api_data = await api_res.json();
        const marketData = api_data.data;
        const now = new Date().toISOString();

        // Prepare the metrics object with all required fields for insertOrUpdateGlobalMetrics
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
            last_updated: now,
            last_fetched: now,
        };

        // Use the imported helper function to handle the database logic
        insertOrUpdateGlobalMetrics(metrics);

        console.log("Global metrics updated successfully.");
        return { success: true };
    } catch (error: unknown) {
        console.error("Error fetching or saving global metrics:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
    }
}

// -----------------------------------------------------------

// GET handler to retrieve the latest cached data
export async function GET() {
    const row = db
      .prepare<[], GlobalMetricsRow>(`SELECT * FROM global_metrics ORDER BY id DESC LIMIT 1`)
      .get();
  
    if (!row) {
      return NextResponse.json({ error: "No global metrics available" }, { status: 404 });
    }
  
    const formattedRow = {
      ...row,
      last_updated_formatted: format_time_ago(row.last_updated),
    };
  
    return NextResponse.json({ metrics: formattedRow });
  }
  

// POST handler to force a new fetch and cache update
export async function POST() {
    try {
      // Fetch and save the latest metrics
      const result = await fetchAndSaveGlobalMetrics();
  
      if (!result.success) {
        if (result.error === "RATE_LIMIT") {
          return NextResponse.json(
            { error: "API rate limit exceeded. Please try again in 30-60 seconds." },
            { status: 429 }
          );
        }
  
        return NextResponse.json(
          { error: "Failed to refresh global metrics." },
          { status: 500 }
        );
      }
  

  
      const row = db
        .prepare<[], GlobalMetricsRow>(`SELECT * FROM global_metrics ORDER BY id DESC LIMIT 1`)
        .get();
  
      if (!row) {
        return NextResponse.json(
          { error: "No global metrics available after refresh." },
          { status: 404 }
        );
      }
  
      // Add formatted "time ago" field
      const formattedRow = {
        ...row,
        last_updated_formatted: format_time_ago(row.last_updated),
      };
  
      return NextResponse.json({ metrics: formattedRow });
    } catch (err) {
      console.error("Unexpected error in POST handler:", err);
      return NextResponse.json(
        { error: "An unexpected server error occurred." },
        { status: 500 }
      );
    }
  }
  