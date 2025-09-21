"use client";

import { Sparklines, SparklinesLine } from "react-sparklines";

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function SparklineChart({ 
  data, 
  width = 100, 
  height = 30, 
  color = "#3b82f6",
  className = ""
}: SparklineChartProps) {
  // Don't render if no data or insufficient data points
  if (!data || data.length < 2) {
    return (
      <div 
        className={`flex items-center justify-center text-gray-400 text-xs ${className}`}
        style={{ width, height }}
      >
        No data
      </div>
    );
  }

  // Filter out null/undefined values and ensure we have numbers
  const cleanData = data.filter((value): value is number => 
    typeof value === 'number' && !isNaN(value) && value > 0
  );

  if (cleanData.length < 2) {
    return (
      <div 
        className={`flex items-center justify-center text-gray-400 text-xs ${className}`}
        style={{ width, height }}
      >
        No data
      </div>
    );
  }

  // Determine color based on trend
  const firstValue = cleanData[0];
  const lastValue = cleanData[cleanData.length - 1];
  const isPositive = lastValue >= firstValue;
  const lineColor = isPositive ? "#10b981" : "#ef4444"; // green for positive, red for negative

  return (
    <div className={className} style={{ width, height }}>
      <Sparklines data={cleanData} width={width} height={height}>
        <SparklinesLine 
          color={lineColor} 
          style={{ strokeWidth: 2, fill: "none" }}
        />
      </Sparklines>
    </div>
  );
}
