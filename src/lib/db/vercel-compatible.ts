// Vercel-compatible database configuration
// This file provides a fallback for Vercel deployment where SQLite files don't persist

import Database from "better-sqlite3";

// Check if we're running on Vercel
const isVercel = process.env.VERCEL === "1";

// Use in-memory database for Vercel (data won't persist between requests)
// For production, consider using Vercel Postgres or another cloud database
const db = isVercel 
  ? new Database(":memory:") 
  : new Database("dashboard.db");

// Initialize tables
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

db.exec(`
  CREATE TABLE IF NOT EXISTS top100 (
    coin_id TEXT PRIMARY KEY,
    rank INTEGER,
    updated_at TEXT,
    FOREIGN KEY(coin_id) REFERENCES coins(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS trending (
    coin_id TEXT PRIMARY KEY,
    rank INTEGER,
    updated_at TEXT,
    FOREIGN KEY(coin_id) REFERENCES coins(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS gainers (
    coin_id TEXT PRIMARY KEY,
    rank INTEGER,
    updated_at TEXT,
    FOREIGN KEY(coin_id) REFERENCES coins(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS losers (
    coin_id TEXT PRIMARY KEY,
    rank INTEGER,
    updated_at TEXT,
    FOREIGN KEY(coin_id) REFERENCES coins(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS global_metrics (
    id INTEGER PRIMARY KEY,
    total_market_cap REAL,
    total_volume REAL,
    btc_dominance REAL,
    eth_dominance REAL,
    market_cap_change_24h REAL,
    extra TEXT,
    last_updated TEXT,
    last_fetched TEXT
  )
`);

export default db;

// Note: On Vercel, this in-memory database will reset on each serverless function invocation
// For production use, consider migrating to:
// 1. Vercel Postgres (recommended for Vercel)
// 2. PlanetScale (MySQL-compatible)
// 3. Supabase (PostgreSQL)
// 4. MongoDB Atlas
// 5. Railway (PostgreSQL)
