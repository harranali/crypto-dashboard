import { NextResponse } from "next/server";
import db from "@/lib/db";
import { insertOrUpdateCoins } from "@/lib/db/coins";

// Helper to create relative time
function formatTimeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Map CoinGecko market coin to our Coin interface
function mapCoinGeckoMarketToCoin(coin: any) {
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
    extra: {
      sparkline_in_7d: coin.sparkline_in_7d || {},
    },
    last_updated: coin.last_updated || new Date().toISOString(),
  };
}

// GET: fetch Top 10 losers from DB
export async function GET() {
  const rows = db
    .prepare(`
      SELECT t.rank, t.updated_at AS losers_updated_at, c.*, c.updated_at AS coin_updated_at
      FROM losers t
      JOIN coins c ON c.id = t.coin_id
      ORDER BY t.rank ASC
    `)
    .all();

  const coins = rows.map((r) => ({
    ...r,
    extra: r.extra ? JSON.parse(r.extra) : {},
    updated_at_formatted: formatTimeAgo(r.losers_updated_at),
  }));

  return NextResponse.json({ coins });
}

// POST: fetch coins and update Top 10 losers
export async function POST() {
  // Fetch top 100 coins from CoinGecko
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true"
  );
  const data: any[] = await res.json();

  // Sort by 24h price change ascending to get losers
  const losers = data
    .sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
    .slice(0, 10);

  // Prepare coins for insert/update
  const coins = losers.map(mapCoinGeckoMarketToCoin);

  // Insert or update coins table
  insertOrUpdateCoins(coins);

  // Update losers table
  const insertLosers = db.prepare(`
    INSERT INTO losers (coin_id, rank, updated_at)
    VALUES (@coin_id, @rank, @updated_at)
    ON CONFLICT(coin_id) DO UPDATE SET
      rank=excluded.rank,
      updated_at=excluded.updated_at
  `);

  const txn = db.transaction((coins: typeof losers) => {
    const now = new Date().toISOString();
    coins.forEach((coin: any, idx: number) => {
      insertLosers.run({
        coin_id: coin.id,
        rank: idx + 1,
        updated_at: now,
      });
    });
  });

  txn(coins);

  // Fetch updated losers with formatted timestamp
  const rows = db
    .prepare(`
      SELECT t.rank, t.updated_at AS losers_updated_at, c.*, c.updated_at AS coin_updated_at
      FROM losers t
      JOIN coins c ON c.id = t.coin_id
      ORDER BY t.rank ASC
    `)
    .all();

  const resultCoins = rows.map((r) => ({
    ...r,
    extra: r.extra ? JSON.parse(r.extra) : {},
    updated_at_formatted: formatTimeAgo(r.losers_updated_at),
  }));

  return NextResponse.json({ success: true, count: losers.length, coins: resultCoins });
}
