// components/CoinTableRowSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function CoinTableRowSkeleton() {
  return (
    <tr className="border-b border-gray-200 animate-pulse">
      {/* Position */}
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-6" />
      </td>

      {/* Coin (Image + Name + Symbol) */}
      <td className="py-3 px-4 flex items-center space-x-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className="flex flex-col">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12 mt-1" />
        </div>
      </td>

      {/* Price */}
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-16" />
      </td>

      {/* 24h % */}
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-12" />
      </td>

      {/* Market Cap */}
      <td className="py-3 px-4">
        <Skeleton className="h-4 w-20" />
      </td>

      {/* 24h Volume (hidden on mobile) */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <Skeleton className="h-4 w-20" />
      </td>

      {/* 7d % (hidden on mobile) */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <Skeleton className="h-4 w-12" />
      </td>

      {/* 7d Chart (hidden on mobile and tablet) */}
      <td className="py-3 px-4 hidden md:table-cell">
        <Skeleton className="h-8 w-24" />
      </td>
    </tr>
  );
}
