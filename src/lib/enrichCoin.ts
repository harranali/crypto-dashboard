export function enrichCoin(coin: any) {
    const extra: any = {};
  
    if (coin.sparkline_in_7d?.price?.length) {
      const prices = coin.sparkline_in_7d.price;
      const first = prices[0];
      const last = prices[prices.length - 1];
  
      // 7d Change %
      extra.sevenDayChange = ((last - first) / first) * 100;
  
      // Volatility (std dev)
      const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
      const variance =
        prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
      extra.volatility = Math.sqrt(variance);
  
      // 7d MA
      extra.ma7 = mean;
    }
  
    // Ratios
    extra.priceToMarketCap = coin.market_cap
      ? coin.current_price / coin.market_cap
      : null;
    extra.priceToVolume = coin.total_volume
      ? coin.current_price / coin.total_volume
      : null;
  
    // Momentum
    extra.momentum = (() => {
      const d1 = coin.price_change_percentage_24h;
      const d7 = extra.sevenDayChange;
      if (d1 > 0 && d7 > 0) return "Uptrend";
      if (d1 > 0 && d7 < 0) return "Short-term spike";
      if (d1 < 0 && d7 > 0) return "Short-term dip";
      return "Downtrend";
    })();
  
    return { ...coin, extra };
  }
  