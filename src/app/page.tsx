import GloblMetricsSection from "@/app/sections/GloblMetricsSection";
import CoinTabsSection from "@/app/sections/CoinTabsSection";


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 md:p-6">
      <GloblMetricsSection />
      <CoinTabsSection />
    </div>
  );
}
