// app/sections/MarketMetrics.tsx
"use client";

interface Metric {
  title: string;
  value: string;
  trend?: string; // e.g., '+2.3%' or 'Stable'
  trendType?: 'up' | 'down' | 'neutral';
}

const metrics: Metric[] = [
  { title: "Total Market Cap", value: "$1.25T", trend: "+2.3%", trendType: "up" },
  { title: "24h Volume", value: "$86B", trend: "-1.1%", trendType: "down" },
  { title: "BTC Dominance", value: "52.8%", trend: "Stable", trendType: "neutral" },
  { title: "ETH Dominance", value: "17.4%", trend: "Stable", trendType: "neutral" },
];

export default function MarketMetrics() {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8">
      {metrics.map((metric) => (
        <div key={metric.title} className="card p-4 metric">
          <span className="text-gray-500 text-sm">{metric.title}</span>
          <span className="value">{metric.value}</span>
          {metric.trend && (
            <span
              className={`text-xs mt-1 ${
                metric.trendType === "up"
                  ? "trend-up"
                  : metric.trendType === "down"
                  ? "trend-down"
                  : "text-gray-400"
              }`}
            >
              {metric.trend}
            </span>
          )}
        </div>
      ))}
    </section>
  );
}
