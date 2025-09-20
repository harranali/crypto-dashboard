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

  // Inline SVG icons
  const WebsiteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.05 9.05 0 01-2.88 1.1 4.52 4.52 0 00-7.7 4.13A12.86 12.86 0 013 2.2a4.52 4.52 0 001.4 6.03 4.49 4.49 0 01-2-.55v.06a4.52 4.52 0 003.63 4.43 4.52 4.52 0 01-2 .08 4.52 4.52 0 004.21 3.13 9.05 9.05 0 01-5.6 1.94A9.32 9.32 0 010 19.54a12.78 12.78 0 006.92 2.03c8.3 0 12.84-6.87 12.84-12.83 0-.2-.01-.39-.02-.58A9.18 9.18 0 0023 3z" />
    </svg>
  );

  const links = [
    {
      label: "Website",
      value: extraDetails.website ?? "N/A",
      icon: <WebsiteIcon />,
      url: extraDetails.website && extraDetails.website !== "N/A" ? extraDetails.website : null,
    },
    {
      label: "Twitter",
      value: extraDetails.twitter ? `@${extraDetails.twitter}` : "N/A",
      icon: <TwitterIcon />,
      url:
        extraDetails.twitter && extraDetails.twitter !== "N/A"
          ? `https://twitter.com/${extraDetails.twitter}`
          : null,
    },
  ];

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

        {links.map((link) => (
          <li key={link.label} className="flex items-center gap-2">
            {link.icon}
            <span className="font-medium">{link.label}:</span>
            {link.url ? (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {link.value}
              </a>
            ) : (
              <span className="text-gray-400">{link.value}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
