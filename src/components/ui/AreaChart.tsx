"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend, type ChartConfig } from "./chart"; // your existing chart exports

interface AreaChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  config?: ChartConfig;
  className?: string;
}

export function AreaChart({ data, xKey, yKey, config = {}, className }: AreaChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <RechartsPrimitive.AreaChart data={data}>
        <RechartsPrimitive.XAxis dataKey={xKey} />
        <RechartsPrimitive.YAxis />
        <RechartsPrimitive.Area
          type="monotone"
          dataKey={yKey}
          stroke="#3b82f6"
          fill="rgba(59,130,246,0.3)"
          strokeWidth={2}
        />
        <ChartTooltip />
        <ChartLegend />
      </RechartsPrimitive.AreaChart>
    </ChartContainer>
  );
}
