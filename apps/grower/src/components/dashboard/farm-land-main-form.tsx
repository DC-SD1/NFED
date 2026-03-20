import type { paths } from "@cf/api";
import { Button, Card, CardContent } from "@cf/ui";
import { Minimize2, MoveDiagonal } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsBoolean, useQueryState } from "nuqs";

import { useApiClient } from "@/lib/api";
import { formatDate } from "@/utils/mapping-helper";

import CropRecommendations from "./farm-land-cards/crop-recommendations";
import FarmManagerCard from "./farm-land-cards/farm-manager-card";
import FarmNameCard from "./farm-land-cards/farm-name-card";
import FulfillmentCenterCard from "./farm-land-cards/fulfillment-center-card";
import LandDetailsCard from "./farm-land-cards/land-details-card";
import LocationDetailsCard from "./farm-land-cards/location-details-card";
import SoilProfileCard from "./farm-land-cards/soil-profile-card";
import SuitabilityNotesCard from "./farm-land-cards/suitability-notes-card";

type FarmDetailResponse =
  paths["/farm-management/get-farm-detail"]["post"]["responses"]["200"]["content"]["application/json"];

interface FarmLandMainFormProps {
  farmDetails: FarmDetailResponse;
}

const FarmLandMainForm = ({ farmDetails }: FarmLandMainFormProps) => {
  const [isExpanded, setIsExpanded] = useQueryState(
    "expanded",
    parseAsBoolean.withDefault(false),
  );

  const t = useTranslations("dashboard.emptyState");
  const api = useApiClient();

  const handleToggleExpand = () => {
    void setIsExpanded(!isExpanded);
  };

  const farmName = farmDetails.farmName || "Unknown Farm";
  const farmManagerName = farmDetails.farmManagerName || ""; // this is to change current logic for adding farm land maybe auto assigning farm manager

  const { data: cropRecommendationsData } = api.useQuery(
    "post",
    "/crop-management/get-recommendation",
    {
      body: { landId: farmDetails.lands?.[0]?.id ?? "" },
    },
    {
      enabled: !!farmDetails.lands?.[0]?.id,
      retry: (failureCount, error) => {
        if (error && "status" in error && error.status === 401) return false;
        return failureCount < 3;
      },
    },
  );

  const { data: soilAnalysisData } = api.useQuery(
    "post",
    "/crop-management/get-soil-analysis",
    {
      body: { landId: farmDetails.lands?.[0]?.id ?? "" },
    },
    {
      enabled: !!farmDetails.lands?.[0]?.id,
      retry: (failureCount, error) => {
        if (error && "status" in error && error.status === 401) return false;
        return failureCount < 3;
      },
    },
  );

  return (
    <>
      <div className="w-full md:hidden">
        <div className="border-gray-light border-b p-4">
          <h1 className="text-lg font-semibold">{farmName}</h1>
        </div>

        <div className="p-4">
          <div className="space-y-2">
            <div className="space-y-2">
              <FarmNameCard
                name={farmName}
                region={farmDetails.region ?? "None"}
                village={farmDetails.village ?? "None"}
              />
              <FarmManagerCard name={farmManagerName} />
            </div>
            <LandDetailsCard
              size={farmDetails.acreage}
              dateAdded={
                farmDetails.lands?.[0]?.createdAt
                  ? formatDate(farmDetails.lands[0].createdAt)
                  : "N/A"
              }
              landSplit={"None"}
            />
            <LocationDetailsCard
              region={farmDetails.region ?? "None"}
              village={farmDetails.village ?? "None"}
              farmName={farmName}
              userId=""
            />
            <FulfillmentCenterCard />
            <CropRecommendations
              name={
                cropRecommendationsData?.[0]?.cropName
                  ? `${cropRecommendationsData?.[0]?.cropName} ${cropRecommendationsData?.[1]?.cropName ? ", " + cropRecommendationsData?.[1]?.cropName : ""}, ${cropRecommendationsData?.[2]?.cropName ? " " + cropRecommendationsData?.[2]?.cropName : ""}`
                  : "pending"
              }
            />
            <SoilProfileCard soilAnalysis={soilAnalysisData} />
            <SuitabilityNotesCard
              suitabilityNotes={cropRecommendationsData?.[0]?.suitabilityNotes}
            />
          </div>

          <Button
            variant="unstyled"
            className="mt-10 w-full font-semibold"
            disabled
          >
            {t("deactivateManager")}
          </Button>
        </div>
      </div>

      <div className="bg-container hidden h-full overflow-hidden rounded-lg md:block">
        <Card className="bg-container flex size-full flex-col rounded-lg border-none px-2 ">
          <div className="border-gray-light flex items-center justify-between border-b border-none p-4">
            <h1 className="text-lg font-semibold xl:text-xl">{farmName}</h1>

            <Button
              onClick={handleToggleExpand}
              variant="unstyled"
              className="flex items-center gap-2 md:flex xl:hidden"
              aria-label={isExpanded ? "Collapse form" : "Expand form"}
            >
              {isExpanded ? (
                <Minimize2 className="text-primary !h-6 !w-6 " />
              ) : (
                <MoveDiagonal className="text-primary !h-6 !w-6 " />
              )}
              <span>{isExpanded ? "Collapse" : "Expand"}</span>
            </Button>
          </div>

          <CardContent className="flex-1 overflow-y-auto p-4 px-2 ">
            <div className="space-y-2">
              <div className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
                <FarmNameCard
                  name={farmName}
                  region={farmDetails.region ?? "None"}
                  village={farmDetails.village ?? "None"}
                />
                <FarmManagerCard name={farmManagerName} />
              </div>
              <LandDetailsCard
                size={farmDetails.acreage}
                dateAdded={
                  farmDetails.lands?.[0]?.createdAt
                    ? formatDate(farmDetails.lands[0].createdAt)
                    : "N/A"
                }
                landSplit={"None"}
              />
              <LocationDetailsCard
                region={farmDetails.region ?? "None"}
                village={farmDetails.village ?? "None"}
                farmName={farmName}
                userId=""
              />
              <FulfillmentCenterCard />
              <CropRecommendations
                name={
                  cropRecommendationsData?.[0]?.cropName
                    ? cropRecommendationsData?.[0]?.cropName
                    : "pending"
                }
              />
              <SoilProfileCard soilAnalysis={soilAnalysisData} />
              {cropRecommendationsData?.[0]?.suitabilityNotes &&
                cropRecommendationsData?.[0]?.suitabilityNotes.length > 0 && (
                  <SuitabilityNotesCard
                    suitabilityNotes={
                      cropRecommendationsData?.[0]?.suitabilityNotes
                    }
                  />
                )}

              <div className="h-4 xl:hidden"></div>
            </div>
            <Button
              variant="unstyled"
              className="mt-10 w-full font-semibold"
              disabled
            >
              {t("deactivateManager")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FarmLandMainForm;
