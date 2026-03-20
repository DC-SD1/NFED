// app/components/CropSelectionForm.tsx
import { SeedingIconSmall } from "@cf/ui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";

// import { showSuccessToast } from "@/lib/utils/toast";
import { FeatureCard } from "../dashboard/feature-card";

export default function FocusCropSelectionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const farmId = searchParams.get("farmId") || undefined;

  const api = useApiClient();
  const { userId: authUserId } = useAuthUser();

  const { data } = api.useQuery(
    "get",
    "/farm-planning/farm-plans/by-farmer",
    {
      params: {
        query: {
          FarmerId: authUserId ?? "",
          FarmId: farmId,
        },
      },
    },
    { enabled: !!authUserId && !!farmId },
  );

  const handleSelect = () => {
    router.push(`/farm-owner/farm-grow/focus-order/agreement`);
  };

  const t = useTranslations("dashboard.grow");

  return (
    <div className="mt-6 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-2">
        <div className="relative w-full">
          <h3 className="font-semibold text-gray-500">
            {t("preferredCropTitle")}
          </h3>
        </div>
        <div className="space-y-4">
          {(data ?? []).length > 0 ? (
            data?.map((crop, index) => (
              <FeatureCard
                icon={<SeedingIconSmall />}
                bgColor="primary-icon-bright"
                key={index}
                title={crop.planName}
                subtitle={crop.farmName}
                cropName={crop.cropName ?? ""}
                onClick={() => handleSelect()}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">{t("noCrops")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
