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
  