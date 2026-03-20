"use client";
import { Card, CardContent } from "@cf/ui";
import { useTranslations } from "next-intl";

interface FulfillmentCenterData {
  name?: string;
  city?: string;
  address?: string;
}

export default function FulfillmentCenterCard({
  name = "The Trade Centre, Tagadzi, Volta Region",
}: FulfillmentCenterData) {
  const t = useTranslations("FarmLands.farmDetails");
  return (
    <Card className="w-full rounded-lg border-none bg-white p-0">
      <CardContent className="py-3">
        <div className="flex items-center justify-between gap-2">
          <div className=" block items-end justify-between">
            <span className="text-gray-dark mb-4 text-sm font-thin">
              {t("fulfilmentCenterTitle")}
            </span>
            <p className="text-md font-normal leading-tight">{name || "N/A"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
