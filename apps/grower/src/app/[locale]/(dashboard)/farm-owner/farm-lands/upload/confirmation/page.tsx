"use client";

import { Button, Card, CardContent } from "@cf/ui";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import PolygonMap from "@/components/map/polygon-map";
import { useApiClient } from "@/lib/api/client";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useFarmLandsFormStore } from "@/lib/stores/farm-lands-form-store";
import { useFarmLandsUploadStore } from "@/lib/stores/upload-store";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { formatArea, formatGeoJsonForMapbox } from "@/lib/utils/map-helpers";

export default function ConfirmationPage() {
  const router = useRouter();
  const t = useTranslations("FarmLands.confirmation");
  const tCommon = useTranslations("common");
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { handleError } = useLocalizedErrorHandler();
  const { userId } = useAuthUser();

  const { uploadResponse } = useFarmLandsUploadStore();
  const { farmName, region, village, landOwnershipType, documentUrl } =
    useFarmLandsFormStore();

  // Create farm mutation
  const createFarmMutation = api.useMutation("post", "/farms", {
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["/farm-management/get-farms"],
      });
      // Navigate to success page
      // Store resets moved to success page to prevent race condition
      router.push(
        `/farm-owner/farm-lands/upload/success?farmName=${encodeURIComponent(farmName)}`,
      );
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  // Redirect if no upload data
  useEffect(() => {
    if (!uploadResponse || !farmName) {
      router.push("/farm-owner/farm-lands/upload");
    }
  }, [uploadResponse, farmName, router]);

  if (!uploadResponse) {
    return null;
  }

  const geoJson = formatGeoJsonForMapbox(uploadResponse);
  const acres = uploadResponse.properties.areaAcres || 0;

  const handleConfirmAndSave = async () => {
    // Validate required fields
    if (!userId) {
      handleError(
        new Error("User not authenticated. Please log in and try again."),
      );
      return;
    }

    if (!farmName || !region || !village) {
      handleError(new Error("Please fill in all required fields."));
      return;
    }

    // Handle coordinates based on geometry type
    let coordinates: number[][][];

    // Backend expects coordinates in the format:
    // [[[lng, lat], [lng, lat], ...]] for a single polygon

    if (uploadResponse.geometry.type === "Polygon") {
      // GeoJSON Polygon already has the correct structure: [[[lng, lat], [lng, lat], ...]]
      coordinates = uploadResponse.geometry.coordinates as number[][][];
    } else if (uploadResponse.geometry.type === "MultiPolygon") {
      // GeoJSON MultiPolygon: [[[[lng, lat], [lng, lat], ...]]]
      // Backend expects just a single polygon, so extract the first one
      const multiPolygonCoords = uploadResponse.geometry
        .coordinates as number[][][][];
      if (
        multiPolygonCoords &&
        multiPolygonCoords.length > 0 &&
        multiPolygonCoords[0]
      ) {
        // Take the first polygon from the MultiPolygon
        coordinates = multiPolygonCoords[0];
      } else {
        handleError(new Error("MultiPolygon has no polygons."));
        return;
      }
    } else {
      handleError(
        new Error("Invalid geometry type. Please upload a valid polygon file."),
      );
      return;
    }

    // let coordinates: number[][][];
    // if (uploadResponse.geometry.type === "Polygon") {
    //   // For Polygon, wrap in an additional array to match MultiPolygon format
    //   coordinates = [uploadResponse.geometry.coordinates as number[][]];
    // } else if (uploadResponse.geometry.type === "MultiPolygon") {
    //   // For MultiPolygon, use as is
    //   coordinates = uploadResponse.geometry.coordinates as number[][][];
    // } else {
    //   handleError(
    //     new Error("Invalid geometry type. Please upload a valid polygon file."),
    //   );
    //   return;
    // }

    // Prepare the API payload
    const payload = {
      name: farmName,
      region: region,
      villageLocation: village,
      agreementUrl: documentUrl || "",
      ownershipType: landOwnershipType || "LandTitle", // Default to LandTitle if not set
      landOwnerId: userId,
      coordinates: coordinates,
    };

    console.log("Submitting farm data:", payload);

    // Trigger the mutation
    createFarmMutation.mutate({
      body: payload,
    });
  };

  return (
    <TopLeftHeaderLayout>
      {/* Main Content */}
      <div className=" flex flex-col items-center justify-center px-1 py-8">
        <div className="w-full max-w-lg space-y-8 sm:pb-16 md:max-w-3xl md:pb-16 lg:max-w-2xl">
          {/* Map Container */}
          <div className="relative h-[220px] w-full overflow-hidden rounded-xl">
            <PolygonMap
              data={geoJson}
              className="size-full"
              boundsPadding={{ top: 50, bottom: 50, left: 50, right: 50 }}
            />
          </div>

          {/* Farm Details Card */}
          <Card className="mt-3 border-0 bg-white shadow-[0px_4px_64px_0px_rgba(22,29,20,0.12)]">
            <CardContent className="p-4">
              {/* Top left and top right */}
              <div className="flex items-center justify-between">
                {/* Farm name - Top left */}
                <div>
                  <p className="text-xs font-semibold text-gray-dark">
                    {t("farmName")}
                  </p>
                  <p className="text-sm font-normal text-foreground">
                    {farmName}
                  </p>
                </div>

                {/* Farm land size - Top right */}
                <div>
                  <p className="text-xs font-semibold text-gray-dark">
                    {t("farmLandSize")}
                  </p>
                  <p className="text-sm font-normal text-foreground">
                    {formatArea(acres)} acres
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="my-1 h-px w-full bg-gray-dark" />

              {/* Two column layout for details */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Region */}
                  <div>
                    <p className="text-xs font-semibold text-gray-dark">
                      {t("region")}
                    </p>
                    <p className="text-sm font-normal text-foreground">
                      {region}
                    </p>
                  </div>

                  {/* Village */}
                  <div>
                    <p className="text-xs font-semibold text-gray-dark">
                      {t("village")}
                    </p>
                    <p className="text-sm font-normal text-foreground">
                      {village}
                    </p>
                  </div>

                  {/* Crop recommendations */}
                  <div>
                    <p className="text-xs font-semibold text-gray-dark">
                      {t("cropRecommendations")}
                    </p>
                    <p className="text-sm font-normal text-foreground">
                      {t("pending")}
                    </p>
                  </div>

                  {/* Soil Profile */}
                  <div>
                    <p className="text-xs font-semibold text-gray-dark">
                      {t("soilProfile")}
                    </p>
                    <p className="text-sm font-normal text-foreground">
                      {t("pending")}
                    </p>
                  </div>

                  {/* Fulfilment center */}
                  <div>
                    <p className="text-xs font-semibold text-gray-dark">
                      {t("fulfilmentCenter")}
                    </p>
                    <p className="text-sm font-normal text-foreground">
                      {t("pending")}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4"></div>
              </div>
            </CardContent>
          </Card>

          {/* Confirm and Save Button */}
          <div className="mt-8">
            <Button
              onClick={handleConfirmAndSave}
              className="h-14 w-full rounded-2xl text-white hover:bg-primary/90"
              size="lg"
              disabled={createFarmMutation.isPending}
            >
              {createFarmMutation.isPending
                ? tCommon("processing")
                : t("confirmAndSave")}
              <ChevronRight className="size-6" />
            </Button>
          </div>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
