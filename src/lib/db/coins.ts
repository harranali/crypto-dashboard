import db from "./index";
import { Coin } from "@/types/coin"; // import the unified Coin type

/**
 * Insert or update coins in the database.
 * Stores the exact data provided without generating extra.
 * Returns nothing. Use a transaction for batch insert.
 */
export function insertOrUpdateCoins(coins: Coin[]) {
  const insertCoin = db.prepare(`
    INSERT INTO coins
      (id, name, symbol, current_price, price_change_percentage_24h, market_cap, total_volume,
       circulating_supply, max_supply, image, extra, updated_at)
    VALUES
      (@id, @name, @symbol, @current_price, @price_change_percentage_24h, @market_cap, @total_volume,
       @circulating_supply, @max_supply, @image, @extra, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      symbol=excluded.symbol,
      current_price=excluded.current_price,
      price_change_percentage_24h=excluded.price_change_percentage_24h,
      market_cap=excluded.market_cap,
      total_volume=excluded.total_volume,
      circulating_supply=excluded.circulating_supply,
      max_supply=excluded.max_supply,
      image=excluded.image,
      extra=excluded.extra,
      updated_at=excluded.updated_at
  `);

  const txn = db.transaction((coins: Coin[]) => {
    coins.forEach((coin) => {
      insertCoin.run({
        ...coin,
        extra: coin.extra ? JSON.stringify(coin.extra) : JSON.stringify({}),
        updated_at: coin.last_updated || new Date().toISOString(),
      });
    });
  });

  txn(coins);
}
