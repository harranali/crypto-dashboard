"use client";

interface Coin {
  name: string;
  symbol: string;
  change: string;
  isUp: boolean;
}

interface TopCoinsListProps {
  title: string;
  coins: Coin[];
}

export default function TopCoinsList({ title, coins }: TopCoinsListProps) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="space-y-2">
        {coins.map((coin) => (
          <div
            key={coin.symbol}
            className="flex justify-between items-center hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
          >
            <span className="font-medium">{coin.name}</span>
            <span
              className={`text-sm font-semibold ${
                coin.isUp ? "text-green-500" : "text-red-500"
              }`}
            >
              {coin.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
