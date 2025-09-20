import { NextResponse } from "next/server";
import { insertOrUpdateCoins } from "@/lib/db/coins";
import db from "@/lib/db";
import type { Coin } from "@/types/coin";
import { calculateExtra } from "@/lib/enrichCoin";

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
  // Await the params object before accessing its properties
  const { id } = await context.params;

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
  // Await the params object before accessing its properties
  const { id } = await context.params;

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
