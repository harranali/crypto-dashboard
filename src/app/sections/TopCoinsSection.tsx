import TopCoinsList from "@/app/components/TopCoinsList";

const trendingCoins = [
  { name: "Bitcoin", symbol: "BTC", change: "+2.5%", isUp: true },
  { name: "Ethereum", symbol: "ETH", change: "+3.2%", isUp: true },
  { name: "Solana", symbol: "SOL", change: "-0.8%", isUp: false },
];

const gainers = [
  { name: "CoinX", symbol: "CX", change: "+23%", isUp: true },
  { name: "CoinA", symbol: "CA", change: "+18%", isUp: true },
  { name: "CoinB", symbol: "CB", change: "+15%", isUp: true },
];

const losers = [
  { name: "CoinY", symbol: "CY", change: "-18%", isUp: false },
  { name: "CoinZ", symbol: "CZ", change: "-12%", isUp: false },
  { name: "CoinC", symbol: "CC", change: "-9%", isUp: false },
];

export default function TopCoinsSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <TopCoinsList title="Top Trending" coins={trendingCoins} />
      <TopCoinsList title="Top Gainers (24h)" coins={gainers} />
      <TopCoinsList title="Top Losers (24h)" coins={losers} />
    </section>
  );
}
