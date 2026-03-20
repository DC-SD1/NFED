"use client";
import { Card, CardContent } from "@cf/ui";
import { useTranslations } from "next-intl";

interface CropRecommendationData {
  name: string;
}

export default function CropRecommendationsCard({
  name = "",
}: CropRecommendationData) {
  const t = useTranslations("FarmLands.farmDetails");
  return (
    <Card className="w-full rounded-lg border-none bg-white p-0">
      <CardContent className="py-3">
        <div className="flex items-center justify-between gap-2">
          <div className=" block items-end justify-between">
            <span className="text-gray-dark mb-4 text-sm font-thin">
              {t("cropRecommendationsTitle")}
            </span>
            <p className="text-md font-normal leading-tight">{name || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
