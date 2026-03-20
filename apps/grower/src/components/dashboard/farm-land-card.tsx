// FarmCard Component - Fixed for mobile
"use client";

import { Button, Card, CardContent, cn } from "@cf/ui";
import { ChevronRight, CircleCheck, Meh, Smile } from "lucide-react";
import { useTranslations } from "next-intl";

import type { GeoFeature } from "@/lib/utils/map-helpers";
import type { LandStatusDisplay } from "@/utils/map-farm-lands";

import PolygonMap from "../map/polygon-map";

interface FarmCardProps {
  farmName: string;
  acreage: number;
  status: LandStatusDisplay;
  hasFarmPlans: boolean;
  location: string;
  cropCultivated: string;
  soilProfile: string;
  data: GeoFeature;
  onMoreDetails?: () => void;
  onStartFarming?: () => void;
  isPending?: boolean;
}

export default function FarmCard({
  farmName = "",
  acreage = 0,
  status,
  hasFarmPlans = false,
  location = "",
  cropCultivated = "",
  soilProfile = "",
  data,
  onMoreDetails,
  onStartFarming,
  isPending = false,
}: FarmCardProps) {
  const t = useTranslations("dashboard.farmLand");
  return (
    <Card className="relative h-[400px] w-full max-w-full overflow-hidden rounded-2xl border-0 shadow-lg">
      <div className="absolute inset-0">
        <PolygonMap
          data={data}
          className="size-full"
          boundsPadding={{ top: 50, bottom: 200, left: 50, right: 50 }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <span
          className={cn(
            "absolute right-3 top-3 inline-block rounded-full px-2 py-1 text-xs",
            status.badgeClassName,
          )}
        >
          {status.label}
        </span>

        {/* Main content */}
        <div className="flex flex-1 flex-col justify-end space-y-4 p-2">
          <CardContent className="relative flex flex-col justify-between rounded-2xl bg-white/95 p-4 backdrop-blur-sm">
            {/* Farm name and acreage */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-normal md:text-base">{farmName}</h3>
                <span className="text-sm font-normal md:text-base">
                  {/* Information grid */}
                  {acreage}{" "}
                  <span className="text-sm font-normal md:text-base">
                    acres
                  </span>
                </span>
              </div>
              {hasFarmPlans && (
                <div className="mb-2 flex flex-row border-b border-gray-200 pb-2 text-xs font-normal">
                  <CircleCheck size={16} className="mr-1 text-primary" />
                  {t("planAdded")}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Location", value: location },
                  { label: "Crop cultivated", value: cropCultivated },
                  { label: "Soil Profile", value: soilProfile },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="h-[90px] space-y-1 rounded-md border border-gray-200 p-1.5 md:p-2"
                  >
                    <p className="flex items-center justify-between gap-1 text-xs font-normal text-gray-dark">
                      {label}
                      {label === "Soil Profile" && (
                        <span className="flex-end flex items-center gap-1">
                          {value.toLowerCase() === "good for farming" && (
                            <Smile className="size-4 text-primary" />
                          )}
                          {value.toLowerCase() === "no suitable crops" && (
                            <Meh className="size-4 text-foreground" />
                          )}
                        </span>
                      )}
                    </p>
                    <p
                      className={cn(
                        "break-all text-xs font-thin text-foreground md:text-sm",
                        value.toLowerCase() === "good for farming" &&
                          "text-primary",
                        value.toLowerCase() === "no suitable crops" &&
                          "text-yellow-dark",
                      )}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* More details button - positioned absolutely at bottom right */}
            <div
              className={cn(
                status.value === "ReadyForFarming"
                  ? "flex items-center justify-between"
                  : "flex justify-end",
              )}
            >
              {status.value === "ReadyForFarming" && (
                <Button
                  variant="unstyled"
                  className="flex items-center p-1 px-0 text-primary md:p-2"
                  onClick={onStartFarming}
                  disabled={isPending}
                  loading={isPending}
                >
                  <span className="text-xs font-semibold md:text-base">
                    {isPending ? "Starting..." : "Start farming"}
                  </span>
                  <ChevronRight className="size-6" />
                </Button>
              )}

              <Button
                onClick={onMoreDetails}
                variant="unstyled"
                className="flex items-center p-1 px-0 text-primary md:p-2"
              >
                <span className="text-xs font-semibold md:text-base">
                  {t("moreDetails")}
                </span>
                <ChevronRight className="ml-1 size-4 md:size-5" />
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
