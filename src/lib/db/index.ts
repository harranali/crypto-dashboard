import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "dashboard.db"));

// Coins table
db.exec(`
  CREATE TABLE IF NOT EXISTS coins (
    id TEXT PRIMARY KEY,
    name TEXT,
    symbol TEXT,
    current_price REAL,
    price_change_percentage_24h REAL,
    market_cap REAL,
    total_volume REAL,
    circulating_supply REAL,
    max_supply REAL,
    image TEXT,
    extra TEXT,
    updated_at TEXT
  )
`);

// Top 100 table
db.exec(`
  CREATE TABLE IF NOT EXISTS top100 (
    coin_id TEXT PRIMARY KEY,
    rank INTEGER,
    updated_at TEXT,
    FOREIGN KEY(coin_id) REFERENCES coins(id)
  )
`);

// Trending table
db.exec(`
  CREATE TABLE IF NOT EXISTS trending (
    coin_id TEXT PRIMARY KEY,
    rank INTEGER,
    updated_at TEXT,
    FOREIGN KEY(coin_id) REFERENCES coins(id)
  )
`);

// Gainers table
db.exec(`
  CREATE TABLE IF NOT EXISTS gainers (
    coin_id TEXT PRIMARY KEY,
    rank INTEGER,
    updated_at TEXT,
    FOREIGN KEY(coin_id) REFERENCES coins(id)
  )
`);

// Losers table
db.exec(`
  CREATE TABLE IF NOT EXISTS losers (
    coin_id TEXT PRIMARY KEY,
    rank INTEGER,
    updated_at TEXT,
    FOREIGN KEY(coin_id) REFERENCES coins(id)
  )
`);

export default db;
