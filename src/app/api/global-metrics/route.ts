import { NextResponse } from "next/server";
import { startGlobalMetricsJob } from "@/jobs/globalMetricsJob";
import db from '@/lib/db';

// Start the job once per server instance
startGlobalMetricsJob();

// Helper: format relative time
function format_time_ago(dateStr?: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 86400)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * The core function to fetch data from the external API and save it to the database.
 * This is the logic you will fill in.
 */
async function fetchAndSaveGlobalMetrics() {
    console.log("Fetching new global metrics from API...");
    try {
        // 🚨 PLACEHOLDER: Insert your API fetching logic here.
        // const api_res = await fetch("YOUR_EXTERNAL_API_URL");
        // const api_data = await api_res.json();

        // 🚨 EXAMPLE DATA - REPLACE THIS WITH YOUR REAL API CALL
        const api_data = {
            data: {
                quote: { USD: { total_market_cap: 2.5e12, total_volume_24h: 90e9 } },
                btc_dominance: 52.5,
                eth_dominance: 18.0,
            }
        };

        const total_market_cap = api_data.data.quote.USD.total_market_cap;
        const total_volume = api_data.data.quote.USD.total_volume_24h;
        const btc_dominance = api_data.data.btc_dominance;
        const eth_dominance = api_data.data.eth_dominance;
        const market_cap_change_24h = (api_data.data.quote.USD.total_market_cap - 2.4e12) / 2.4e12 * 100; // Example calculation
        const last_updated = new Date().toISOString();

        // Save new data to the database
        db.prepare(`
            INSERT INTO global_metrics (
                total_market_cap,
                total_volume,
                btc_dominance,
                eth_dominance,
                market_cap_change_24h,
                last_updated
            ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            total_market_cap,
            total_volume,
            btc_dominance,
            eth_dominance,
            market_cap_change_24h,
            last_updated
        );

        console.log("Global metrics updated successfully.");
        return true;
    } catch (error) {
        console.error("Error fetching or saving global metrics:", error);
        return false;
    }
}

// -----------------------------------------------------------

// GET handler to retrieve the latest cached data
export async function GET() {
    const row = db.prepare(`SELECT * FROM global_metrics ORDER BY id DESC LIMIT 1`).get();
    if (!row) return NextResponse.json({ error: "No global metrics available" }, { status: 404 });

    // Add formatted "time ago" field
    const formattedRow = {
        ...row,
        last_updated_formatted: format_time_ago(row.last_updated)
    };

    return NextResponse.json({ metrics: formattedRow });
}

// POST handler to force a new fetch and cache update
export async function POST() {
    const success = await fetchAndSaveGlobalMetrics();
    if (!success) {
        return NextResponse.json(
            { error: "Failed to refresh global metrics. Please try again." },
            { status: 500 }
        );
    }
    // After a successful refresh, return the newly fetched data
    const row = db.prepare(`SELECT * FROM global_metrics ORDER BY id DESC LIMIT 1`).get();
    const formattedRow = {
        ...row,
        last_updated_formatted: format_time_ago(row.last_updated)
    };
    return NextResponse.json({ metrics: formattedRow });
}