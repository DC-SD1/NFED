"use client";

import { Card, CardContent } from "@cf/ui";
import { useTranslations } from "next-intl";

interface LandDetailsData {
  size?: number;
  dateAdded?: string;
  landSplit?: string;
}

export default function LandDetailsCard({
  size = 0,
  dateAdded = "",
  landSplit = "",
}: LandDetailsData) {
  const t = useTranslations("FarmLands.farmDetails");

  const landDetails = [
    { label: t("landSizeTitle"), value: `${size} acres` },
    { label: t("dateTitle"), value: dateAdded },
    { label: t("landSplitTitle"), value: landSplit },
  ];

  return (
    <Card className="w-full rounded-lg border-none bg-white">
      <CardContent className="p-4">
        {/* Tablet and Desktop: Grid Layout */}
        <div className="grid grid-cols-3 gap-4 lg:gap-6">
          {landDetails.map(({ label, value }) => (
            <div key={label} className="space-y-2">
              <p className="text-gray-dark text-xs font-thin">{label}</p>
              <p className="text-sm font-normal leading-tight">
                {value || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
