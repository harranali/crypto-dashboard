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

// Map CoinGecko market coin to our Coin interface for Top100
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

// GET: fetch Top 100 coins from DB
export async function GET() {
  const rows = db
    .prepare(`
      SELECT 
        t.rank, 
        t.updated_at AS top100_updated_at, 
        c.*, 
        c.updated_at AS coin_updated_at
      FROM top100 t
      JOIN coins c ON c.id = t.coin_id
      ORDER BY t.rank ASC
    `)
    .all() as Array<Coin & { rank: number; top100_updated_at: string }>;

  const coins = rows.map((r) => ({
    ...r,
    extra: JSON.parse(r.extra), // parse stored JSON string
    updated_at_formatted: formatTimeAgo(r.top100_updated_at),
  }));

  return NextResponse.json({ coins });
}

// POST: fetch from CoinGecko and update DB
export async function POST() {
  // Fetch top 100 market data from CoinGecko
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true"
  );
  const data: CoinGeckoMarket[] = await res.json();

  // Prepare coins for insert
  const coins: Coin[] = data.map(mapCoinGeckoMarketToCoin);

  // Insert or update coins table
  insertOrUpdateCoins(coins);

  // Extract top100 coin IDs from response
  const top100Ids = coins.map((coin) => coin.id);

  const now = new Date().toISOString();

  // Begin transaction
  const txn = db.transaction(() => {
    // 1. Delete top100 entries not in the latest top100Ids
    db.prepare(
      `DELETE FROM top100 WHERE coin_id NOT IN (${top100Ids.map(() => "?").join(",")})`
    ).run(...top100Ids);

    // 2. Insert or update top100 ranks
    const insertTop100 = db.prepare(`
      INSERT INTO top100 (coin_id, rank, updated_at)
      VALUES (@coin_id, @rank, @updated_at)
      ON CONFLICT(coin_id) DO UPDATE SET
        rank=excluded.rank,
        updated_at=excluded.updated_at
    `);

    coins.forEach((coin, idx) => {
      insertTop100.run({
        coin_id: coin.id,
        rank: idx + 1,
        updated_at: now,
      });
    });
  });

  txn();

  // Fetch updated top100 coins with formatted timestamp
  const rows = db
    .prepare(`
      SELECT 
        t.rank, 
        t.updated_at AS top100_updated_at, 
        c.*, 
        c.updated_at AS coin_updated_at
      FROM top100 t
      JOIN coins c ON c.id = t.coin_id
      ORDER BY t.rank ASC
    `)
    .all() as Array<Coin & { rank: number; top100_updated_at: string }>;

  const resultCoins = rows.map((r) => ({
    ...r,
    extra: JSON.parse(r.extra),
    updated_at_formatted: formatTimeAgo(r.top100_updated_at),
  }));

  return NextResponse.json({ success: true, count: data.length, coins: resultCoins });
}
