export interface Coin {
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
    extra: string; // stored as JSON string in DB
    last_updated?: string;
  }
  
// Parsed coin for frontend usage
export interface ParsedCoin extends Omit<Coin, "extra"> {
  extra: CoinExtra;
  // derived fields for UI
  price_formatted?: string;
  change_formatted?: string;
  is_up?: boolean;
}

// Parsed version with extra as an object
export interface CoinExtra {
  seven_day_change?: number;
  volatility?: number;
  ma7?: number;
  price_to_market_cap?: number;
  price_to_volume?: number;
  momentum?: string;
  percent_to_ath?: number;
  circulating_percent?: number;
  sparkline?: number[];
  last_fetched?: string;
  rank?: string;
  all_time_high?: string;
  all_time_low?: string;
  description?: string;
  website?: string;
  twitter?: string;
  reddit?: string;
  dev_score?: string;
  last_fetched_formatted?: string
}