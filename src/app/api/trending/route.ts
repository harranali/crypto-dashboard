import { NextResponse } from "next/server";
import db from "@/lib/db";
import { insertOrUpdateCoins } from "@/lib/db/coins";
import { Coin } from "@/types/coin";

// Helper to create relative time
function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// CoinGecko market coin type
interface CoinGeckoMarket {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  max_supply: number;
  image: string;
  sparkline_in_7d?: unknown;
  last_updated?: string;
}

// Map CoinGecko market coin to our Coin interface
function mapCoinGeckoMarketToCoin(coin: CoinGeckoMarket): Coin {
  return {
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    current_price: coin.current_price,
    price_change_percentage_24h: coin.price_change_percentage_24h,
    market_cap: coin.market_cap,
    total_volume: coin.total_volume,
    circulating_supply: coin.circulating_supply,
    max_supply: coin.max_supply,
    image: coin.image,
    extra: JSON.stringify({ sparkline_in_7d: coin.sparkline_in_7d || {} }),
    last_updated: coin.last_updated || new Date().toISOString(),
  };
}


// GET: fetch trending coins from DB
export async function GET() {
  const rows = db
    .prepare(`
      SELECT t.rank, t.updated_at, c.*
      FROM trending t
      JOIN coins c ON c.id = t.coin_id
      ORDER BY t.rank ASC
    `)
    .all() as Array<Coin & { rank: number; updated_at: string }>;

  const coins = rows.map((r) => ({
    ...r,
    extra: r.extra ? JSON.parse(r.extra as string) : {},
    updated_at_formatted: formatTimeAgo(r.updated_at),
  }));

  return NextResponse.json({ coins });
}

// POST: fetch trending coins and update DB
export async function POST() {
  // Fetch trending coins IDs from CoinGecko
  const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
  const data: { coins: { item: { id: string } }[] } = await res.json();
  const trendingIds = data.coins.map((c) => c.item.id);

  if (!trendingIds.length) return NextResponse.json({ success: true, count: 0, coins: [] });

  // Fetch market data for trending coins
  const marketRes = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${trendingIds.join(
      ","
    )}&sparkline=true`
  );
  const marketData: CoinGeckoMarket[] = await marketRes.json();

  // Reorder marketData to match trendingIds order
  const orderedMarketData: Coin[] = trendingIds
    .map((id) => marketData.find((c) => c.id === id))
    .filter((c): c is CoinGeckoMarket => Boolean(c))
    .map(mapCoinGeckoMarketToCoin);

  // Insert or update coins table
  insertOrUpdateCoins(orderedMarketData);

  const now = new Date().toISOString();

  const txn = db.transaction(() => {
    // 1. Delete trending entries not in the latest trendingIds
    if (trendingIds.length) {
      db.prepare(
        `DELETE FROM trending WHERE coin_id NOT IN (${trendingIds.map(() => "?").join(",")})`
      ).run(...trendingIds);
    }

    // 2. Insert or update trending ranks
    const insertTrending = db.prepare(`
      INSERT INTO trending (coin_id, rank, updated_at)
      VALUES (@coin_id, @rank, @updated_at)
      ON CONFLICT(coin_id) DO UPDATE SET
        rank=excluded.rank,
        updated_at=excluded.updated_at
    `);

    orderedMarketData.forEach((coin, idx) => {
      insertTrending.run({
        coin_id: coin.id,
        rank: idx + 1,
        updated_at: now,
      });
    });
  });

  txn();

  // Fetch updated trending coins with formatted timestamp
  const rows = db
    .prepare(`
      SELECT t.rank, t.updated_at, c.*
      FROM trending t
      JOIN coins c ON c.id = t.coin_id
      ORDER BY t.rank ASC
    `)
    .all() as Array<Coin & { rank: number; updated_at: string }>;

  const coins = rows.map((r) => ({
    ...r,
    extra: r.extra ? JSON.parse(r.extra as string) : {},
    updated_at_formatted: formatTimeAgo(r.updated_at),
  }));

  return NextResponse.json({ success: true, count: orderedMarketData.length, coins });
}
