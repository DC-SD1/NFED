"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { useInitializedEffectOnce } from "@cf/common/hooks";
import { Button, Card, CardContent } from "@cf/ui";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import PolygonMap from "@/components/map/polygon-map";
import { useFarmLandsUploadStore } from "@/lib/stores/upload-store";
import { formatArea, formatGeoJsonForMapbox } from "@/lib/utils/map-helpers";

export default function ConfirmFarmLandPage() {
  const router = useRouter();
  const t = useTranslations("FarmLands.confirm");
  const { uploadResponse, resetUpload, file } = useFarmLandsUploadStore();

  // Redirect if no upload data
  useInitializedEffectOnce(() => {
    const fileFormat = file?.type.includes("kml") ? "kml" : "csv";
    if (!uploadResponse) {
      router.push(`/farm-owner/farm-lands/upload?type=${fileFormat}`);
    }
  }, [uploadResponse, file, router]);

  if (!uploadResponse) {
    return null;
  }

  const geoJson = formatGeoJsonForMapbox(uploadResponse);
  const acres = uploadResponse.properties.areaAcres || 0;
  const fileFormat = file?.type.includes("kml") ? "kml" : "csv";

  const handleContinue = () => {
    // Navigate to additional details page
    router.push("/farm-owner/farm-lands/upload/additional-details");
  };

  const handleReupload = () => {
    resetUpload();
    router.push(`/farm-owner/farm-lands/upload?type=${fileFormat}`);
  };

  return (
    <TopLeftHeaderLayout>
      <div className=" flex flex-col items-center justify-center px-1 py-8">
        {/* Help Button */}
        {/* <button
          className="absolute bottom-[24px] right-[24px] z-10 flex size-[60px] items-center justify-center rounded-xl bg-[#002200]"
          onClick={() => {
            // TODO: Implement help functionality
          }}
        >
          <Headset className="size-6 text-[#7DFE6B]" />
        </button> */}

        {/* Main Content */}
        <div className="w-full max-w-lg space-y-8 sm:pb-16 md:max-w-4xl md:pb-16 lg:max-w-2xl">
          {/* Map Container */}
          <div className="relative h-[328px] w-full overflow-hidden rounded-xl">
            <PolygonMap data={geoJson} className="size-full" />
          </div>

          {/* Farm Size Card */}
          <Card className="mt-4 border-0 bg-white">
            <CardContent className="flex flex-col gap-[10px] p-5">
              <p className="text-sm font-semibold text-[#71786C]">
                {t("farmLandSize")}
              </p>
              <p className="text-base font-normal text-[#161D14]">
                {formatArea(acres)} acres
              </p>
            </CardContent>
          </Card>

          {/* Question and Buttons */}
          <div className="my-2 space-y-12">
            <h2 className="text-base font-normal text-[#525C4E]">
              {t("question")}
            </h2>

            <div className="mt-20 flex flex-col gap-6">
              <Button
                onClick={handleContinue}
                className="h-14 w-full rounded-2xl text-white hover:bg-[#2FA027]"
                size="lg"
              >
                {t("yesContinue")}
                <ChevronRight className="size-6" />
              </Button>

              <Button
                onClick={handleReupload}
                variant="secondary"
                className="h-14 w-full rounded-2xl bg-gray-light text-[#1A5514] hover:bg-gray-light/90"
                size="lg"
              >
                {t("reUpload")}
                <ChevronRight className="size-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
