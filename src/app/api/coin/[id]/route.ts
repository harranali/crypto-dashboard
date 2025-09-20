import { NextResponse } from "next/server";
import { insertOrUpdateCoins } from "@/lib/db/coins";
import db from "@/lib/db";
import type { Coin } from "@/types/coin";

// Helper to calculate extra metrics safely
function calculateExtra(data: any) {
    const sparkline = data.market_data?.sparkline_7d?.price || [];
    const first = sparkline[0] || 0;
    const last = sparkline[sparkline.length - 1] || 0;
  
    const mean = sparkline.length
      ? sparkline.reduce((a: number, b: number) => a + b, 0) / sparkline.length
      : 0;
    const variance = sparkline.length
      ? sparkline.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / sparkline.length
      : 0;
  
    const percentToATH = data.market_data?.ath?.usd
      ? ((data.market_data.current_price.usd / data.market_data.ath.usd) - 1) * 100
      : null;
  
    const circulatingPercent = data.market_data?.max_supply
      ? (data.market_data.circulating_supply / data.market_data.max_supply) * 100
      : null;
  
    const momentum = last > first ? "Bullish" : last < first ? "Bearish" : "Neutral";
  
    const lastFetched = new Date().toISOString();
  
    // ✅ About section fields, safely defaulting to "N/A"
    const rank = data.market_cap_rank != null ? data.market_cap_rank.toString() : "N/A";
    const allTimeHigh = data.market_data?.ath?.usd != null ? `$${data.market_data.ath.usd.toLocaleString()}` : "N/A";
    const allTimeLow = data.market_data?.atl?.usd != null ? `$${data.market_data.atl.usd.toLocaleString()}` : "N/A";
    const description = data.description?.en || "N/A";
    const website = data.links?.homepage?.[0] || "N/A";
    const twitter = data.links?.twitter_screen_name || "N/A";
    const reddit = data.links?.subreddit_url || "N/A";
    const devScore = data.developer_score != null ? data.developer_score.toString() : "N/A";
  
    return {
      sevenDayChange: first ? ((last - first) / first) * 100 : 0,
      volatility: Math.sqrt(variance),
      ma7: mean,
      priceToMarketCap: data.market_data?.market_cap?.usd
        ? data.market_data.current_price.usd / data.market_data.market_cap.usd
        : null,
      priceToVolume: data.market_data?.total_volume?.usd
        ? data.market_data.current_price.usd / data.market_data.total_volume.usd
        : null,
      momentum,
      percentToATH,
      circulatingPercent,
      sparkline,
      lastFetched, // raw ISO string only
  
      // About section
      rank,
      allTimeHigh,
      allTimeLow,
      description,
      website,
      twitter,
      reddit,
      devScore,
    };
  }
  

// Helper to format relative time
function formatTimeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// GET: fetch details from cached coins table
export async function GET(req: Request, context: { params: { id: string } }) {
  const { params } = context; // you must get it from context
  const id = params.id;

  const row = db.prepare(`SELECT * FROM coins WHERE id = ?`).get(id);

  if (!row) {
    return NextResponse.json({ error: "Coin not found in cache" }, { status: 404 });
  }

  const extra = row.extra ? JSON.parse(row.extra) : {};
  const lastFetchedFormatted = extra.lastFetched ? formatTimeAgo(extra.lastFetched) : null;

  return NextResponse.json({
    coinData: {
      id: row.id,
      symbol: row.symbol,
      price: `$${row.current_price?.toLocaleString() || "0"}`,
      change: `${row.price_change_percentage_24h?.toFixed(2) || "0"}%`,
      isUp: (row.price_change_percentage_24h || 0) > 0,
      marketCap: row.market_cap || 0,
      volume: row.total_volume || 0,
      supply: row.circulating_supply?.toLocaleString() || "0",
      maxSupply: row.max_supply?.toLocaleString() || "0",
      image: row.image || "",
      extra: { ...extra, lastFetchedFormatted },
    },
    sparkline: extra.sparkline || [],
  });
}

// POST: fetch from CoinGecko and update DB
export async function POST(req: Request, context: { params: { id: string } }) {
  const { params } = await context; // ✅ await context
  const id = params.id;

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&market_data=true&sparkline=true`
    );
    if (!res.ok) throw new Error("Failed to fetch CoinGecko data");

    const data = await res.json();
    const extraObj = calculateExtra(data); // this is an object
    const extraStr = JSON.stringify(extraObj); // convert to string for DB

    const coin: Coin = {
      id: data.id,
      name: data.name,
      symbol: data.symbol,
      current_price: data.market_data?.current_price?.usd || 0,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
      market_cap: data.market_data?.market_cap?.usd || 0,
      total_volume: data.market_data?.total_volume?.usd || 0,
      circulating_supply: data.market_data?.circulating_supply || 0,
      max_supply: data.market_data?.max_supply || 0,
      image: data.image?.thumb || "",
      extra: extraStr,
      last_updated: data.last_updated || new Date().toISOString(),
    };

    insertOrUpdateCoins([coin]);

    return NextResponse.json({
      coinData: {
        id: coin.id,
        symbol: coin.symbol,
        price: `$${coin.current_price.toLocaleString()}`,
        change: `${coin.price_change_percentage_24h.toFixed(2)}%`,
        isUp: coin.price_change_percentage_24h > 0,
        marketCap: `$${coin.market_cap.toLocaleString()}`,
        volume: `$${coin.total_volume.toLocaleString()}`,
        supply: coin.circulating_supply.toLocaleString(),
        maxSupply: coin.max_supply.toLocaleString(),
        image: coin.image,
        extra: extraObj,
      },
      sparkline: extraObj.sparkline,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
