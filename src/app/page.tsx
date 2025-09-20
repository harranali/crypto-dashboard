import MetricsSection from "@/app/sections/MetricsSection";
import TopCoinsSection from "@/app/sections/TopCoinsSection";

import CoinTabsSection from "@/app/sections/CoinTabsSection";

// Dummy data
const top100 = [/* array of coins */];
const trending = [/* array of coins */];
const gainers = [/* array of coins */];
const losers = [/* array of coins */];


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 md:p-6">
      <MetricsSection />
      <TopCoinsSection />
      
      <CoinTabsSection
        top100={top100}
        trending={trending}
        gainers={gainers}
        losers={losers}
      />
      
    </div>
  );
}
