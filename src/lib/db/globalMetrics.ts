import db from "./index";

export function insertOrUpdateGlobalMetrics(metrics: {
  total_market_cap: number;
  total_volume: number;
  btc_dominance: number;
  eth_dominance: number;
  market_cap_change_24h: number;
  extra: string;
  last_updated: string;
  last_fetched: string;
}) {

  db.prepare(`
    INSERT INTO global_metrics (
      id,
      total_market_cap,
      total_volume,
      btc_dominance,
      eth_dominance,
      market_cap_change_24h,
      extra,
      last_updated,
      last_fetched
    ) VALUES (
      1, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      total_market_cap = excluded.total_market_cap,
      total_volume = excluded.total_volume,
      btc_dominance = excluded.btc_dominance,
      eth_dominance = excluded.eth_dominance,
      market_cap_change_24h = excluded.market_cap_change_24h,
      extra = excluded.extra,
      last_updated = excluded.last_updated,
      last_fetched = excluded.last_fetched
  `).run(
    metrics.total_market_cap,
    metrics.total_volume,
    metrics.btc_dominance,
    metrics.eth_dominance,
    metrics.market_cap_change_24h,
    metrics.extra,
    metrics.last_updated,
    metrics.last_fetched
  );
}
