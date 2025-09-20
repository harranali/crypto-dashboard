"use client";

import { Info, CircleArrowUp, CircleArrowDown } from "lucide-react";
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value?: string | number | null;
  tooltipContent?: string;
}

export function MetricCard({ label, value, tooltipContent }: MetricCardProps) {
  // Convert value to number if possible
  const numericValue = typeof value === "number" ? value : parseFloat((value || "").toString().replace("%", ""));
  const isNumber = !isNaN(numericValue);

  const displayValue = isNumber ? (value?.toString() || "0") : "N/A";
  const showArrow = isNumber && numericValue !== 0;
  const positive = numericValue > 0;

  return (
    <div className="relative p-4 bg-white shadow-sm rounded-lg flex flex-col text-gray-700 hover:shadow-md transition">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-sm text-gray-500">{label}</span>
        {tooltipContent && (
          <TooltipProvider>
            <ShadTooltip>
              <TooltipTrigger asChild>
                <Info size={14} className="text-gray-400 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{tooltipContent}</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showArrow && (
          <span className={cn(positive ? "text-green-500" : "text-red-500")}>
            {positive ? <CircleArrowUp size={16} /> : <CircleArrowDown size={16} />}
          </span>
        )}
        <span className={cn("text-lg font-bold", showArrow ? (positive ? "text-green-500" : "text-red-500") : "")}>
          {displayValue}
        </span>
      </div>
    </div>
  );
}
