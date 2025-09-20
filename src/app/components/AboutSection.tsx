"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ExtraDetails {
  allTimeHigh?: string;
  allTimeLow?: string;
  rank?: string;
  rankChange24h?: number;
  devScore?: string;
  description?: string;
  website?: string;
  twitter?: string;
  reddit?: string;
}

interface AboutSectionProps {
  extraDetails: ExtraDetails;
}

export function AboutSection({ extraDetails }: AboutSectionProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const truncatedDescription =
    extraDetails.description?.length > 200
      ? extraDetails.description.slice(0, 200) + "..."
      : extraDetails.description;

  const descriptionToDisplay = showFullDescription
    ? extraDetails.description
    : truncatedDescription;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-lg">About</p>
      {extraDetails.description && (
        <div className="text-sm text-gray-600">
          <p>{descriptionToDisplay}</p>
          {extraDetails.description.length > 200 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-500 underline text-sm mt-1"
            >
              {showFullDescription ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}
      <ul className="list-none space-y-2 text-sm text-gray-600 mt-2">
        <li className="flex justify-between items-center">
          <span className="font-medium">Market Rank:</span>
          <Badge variant="secondary" className="bg-gray-200 text-gray-700">
            {extraDetails.rank ?? "N/A"}
          </Badge>
        </li>
        <li className="flex justify-between items-center">
          <span className="font-medium">All-time High:</span>
          <span>{extraDetails.allTimeHigh ?? "N/A"}</span>
        </li>
        <li className="flex justify-between items-center">
          <span className="font-medium">All-time Low:</span>
          <span>{extraDetails.allTimeLow ?? "N/A"}</span>
        </li>
        {extraDetails.website && (
          <li>
            <a
              href={extraDetails.website}
              target="_blank"
              className="flex items-center gap-2 text-blue-500 hover:underline"
            >
              <img src="/icons/website.svg" alt="Website" className="w-4 h-4" />
              Official Website
            </a>
          </li>
        )}
        {extraDetails.twitter && (
          <li>
            <a
              href={`https://twitter.com/${extraDetails.twitter}`}
              target="_blank"
              className="flex items-center gap-2 text-blue-500 hover:underline"
            >
              <img src="/icons/twitter.svg" alt="Twitter" className="w-4 h-4" />
              @{extraDetails.twitter}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
