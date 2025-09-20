"use client";

import { Info, CircleArrowUp, CircleArrowDown } from "lucide-react";
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value?: string | number | null;
  tooltipContent?: string;
  type?: "number" | "percent" | "dollar" | "string" | "ratio"; // Type flag
}

export function MetricCard({ label, value, tooltipContent, type = "string" }: MetricCardProps) {
  let displayValue: string;
  let showArrow = false;
  let positive = false;

  if (type === "string") {
    displayValue = value?.toString() || "N/A";
  } else {
    const numericValue = typeof value === "number"
      ? value
      : parseFloat((value || "").toString().replace("%", "").replace("$", "").replace(/,/g, ""));
    const isNumber = !isNaN(numericValue);

    displayValue = isNumber
      ? type === "percent"
        ? numericValue.toFixed(2) + "%"
        : type === "dollar"
        ? `$${numericValue.toLocaleString()}`
        : type === "ratio"
        ? numericValue.toFixed(6)
        : numericValue.toLocaleString()
      : "N/A";

    showArrow = isNumber && numericValue !== 0;
    positive = numericValue > 0;
  }

  // Use stronger green
  const greenClass = "text-green-700";
  const redClass = "text-red-600";

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
          <span className={cn(positive ? greenClass : redClass)}>
            {positive ? <CircleArrowUp size={16} /> : <CircleArrowDown size={16} />}
          </span>
        )}
        <span className={cn("text-lg font-bold", showArrow ? (positive ? greenClass : redClass) : "")}>
          {displayValue}
        </span>
      </div>
    </div>
  );
}
