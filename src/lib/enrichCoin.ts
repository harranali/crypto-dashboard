// Helper to calculate extra metrics safely
export function calculateExtra(data: any) {
  const sparkline = data.market_data?.sparkline_7d?.price || [];
  const first = sparkline[0] || 0;
  const last = sparkline[sparkline.length - 1] || 0;

  const mean = sparkline.length
    ? sparkline.reduce((a: number, b: number) => a + b, 0) / sparkline.length
    : 0;
  const variance = sparkline.length
    ? sparkline.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / sparkline.length
    : 0;

  const percentToATH = data.market_data?.ath?.usd
    ? ((data.market_data.current_price.usd / data.market_data.ath.usd) - 1) * 100
    : null;

  const circulatingPercent = data.market_data?.max_supply
    ? (data.market_data.circulating_supply / data.market_data.max_supply) * 100
    : null;

  const momentum = last > first ? "Bullish" : last < first ? "Bearish" : "Neutral";

  const lastFetched = new Date().toISOString();

  // ✅ About section fields, safely defaulting to "N/A"
  const rank = data.market_cap_rank != null ? data.market_cap_rank.toString() : "N/A";
  const allTimeHigh = data.market_data?.ath?.usd != null ? `$${data.market_data.ath.usd.toLocaleString()}` : "N/A";
  const allTimeLow = data.market_data?.atl?.usd != null ? `$${data.market_data.atl.usd.toLocaleString()}` : "N/A";
  const description = data.description?.en || "N/A";
  const website = data.links?.homepage?.[0] || "N/A";
  const twitter = data.links?.twitter_screen_name || "N/A";
  const reddit = data.links?.subreddit_url || "N/A";
  const devScore = data.developer_score != null ? data.developer_score.toString() : "N/A";

  return {
    sevenDayChange: first ? ((last - first) / first) * 100 : 0,
    volatility: Math.sqrt(variance),
    ma7: mean,
    priceToMarketCap: data.market_data?.market_cap?.usd
      ? data.market_data.current_price.usd / data.market_data.market_cap.usd
      : null,
    priceToVolume: data.market_data?.total_volume?.usd
      ? data.market_data.current_price.usd / data.market_data.total_volume.usd
      : null,
    momentum,
    percentToATH,
    circulatingPercent,
    sparkline,
    lastFetched, // raw ISO string only

    // About section
    rank,
    allTimeHigh,
    allTimeLow,
    description,
    website,
    twitter,
    reddit,
    devScore,
  };
}

// export function enrichCoin(coin: any) {
//     const extra: any = {};
  
//     if (coin.sparkline_in_7d?.price?.length) {
//       const prices = coin.sparkline_in_7d.price;
//       const first = prices[0];
//       const last = prices[prices.length - 1];
  
//       // 7d Change %
//       extra.sevenDayChange = ((last - first) / first) * 100;
  
//       // Volatility (std dev)
//       const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
//       const variance =
//         prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
//       extra.volatility = Math.sqrt(variance);
  
//       // 7d MA
//       extra.ma7 = mean;
//     }
  
//     // Ratios
//     extra.priceToMarketCap = coin.market_cap
//       ? coin.current_price / coin.market_cap
//       : null;
//     extra.priceToVolume = coin.total_volume
//       ? coin.current_price / coin.total_volume
//       : null;
  
//     // Momentum
//     extra.momentum = (() => {
//       const d1 = coin.price_change_percentage_24h;
//       const d7 = extra.sevenDayChange;
//       if (d1 > 0 && d7 > 0) return "Uptrend";
//       if (d1 > 0 && d7 < 0) return "Short-term spike";
//       if (d1 < 0 && d7 > 0) return "Short-term dip";
//       return "Downtrend";
//     })();
  
//     return { ...coin, extra };
//   }
  