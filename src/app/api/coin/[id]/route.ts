import { NextResponse, type NextRequest } from "next/server";
import { insertOrUpdateCoins } from "@/lib/db/coins";
import db from "@/lib/db";
import type { Coin } from "@/types/coin";
import { calculateExtra } from "@/lib/enrichCoin";

// Helper to format relative time
function format_time_ago(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// GET: fetch details from cached coins table
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 must be Promise
) {
  const { id } = await context.params; // 👈 now you need await

  const row = db.prepare(`SELECT * FROM coins WHERE id = ?`).get(id) as Coin | undefined;;

  if (!row) {
    return NextResponse.json({ error: "Coin not found in cache" }, { status: 404 });
  }

  const extra = row.extra ? JSON.parse(row.extra) : {};
  const last_fetched_formatted = extra.last_fetched ? format_time_ago(extra.last_fetched) : null;

  return NextResponse.json({
    coin_data: {
      id: row.id,
      name: row.name,
      symbol: row.symbol,
      current_price: row.current_price,
      price_change_percentage_24h: row.price_change_percentage_24h,
      market_cap: row.market_cap,
      total_volume: row.total_volume,
      circulating_supply: row.circulating_supply,
      max_supply: row.max_supply,
      image: row.image,
      extra,
      last_updated: row.last_updated,
      last_fetched_formatted,
    },
  });
}

// POST: fetch from CoinGecko and update DB
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 must be Promise
) {
  const { id } = await context.params; // 👈 await again

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&market_data=true&sparkline=true`
    );
    if (!res.ok) {
      throw new Error("API rate limit exceeded. Please try again in 30-60 seconds.");
    }

    const data = await res.json();
    const extra_obj = calculateExtra(data);
    const extra_str = JSON.stringify(extra_obj);

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
      extra: extra_str,
      last_updated: data.last_updated || new Date().toISOString(),
    };

    insertOrUpdateCoins([coin]);

    return NextResponse.json({
      coin_data: {
        ...coin,
        extra: extra_obj,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
