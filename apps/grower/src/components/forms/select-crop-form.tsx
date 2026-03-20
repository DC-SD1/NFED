// app/components/CropSelectionForm.tsx
import { CheckListIcon } from "@cf/ui/icons";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// import { parseAsString, useQueryState } from "nuqs";
import { CropSelectionCard } from "../dashboard/crop-select-card";

export default function CropSelectionForm() {
  const router = useRouter();
  const handleSelect = (cropName: string) => {
    router.push(
      "/farm-owner/farm-grow/buyer-order/order-details?cropName=" + cropName,
    );
  };
  const t = useTranslations("dashboard.grow");

  const crops: any = [];

  return (
    <div>
      <div className="mx-auto w-full space-y-6">
        {crops.length > 0 ? (
          <>
            <div className="relative mb-3 w-full rounded-xl">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-2">
                  <div className="size-8 items-center justify-center rounded-full bg-blue-200">
                    <div className="self-center">
                      <CheckListIcon />
                    </div>
                  </div>
                  <h2 className="font-semibold text-gray-500">
                    {t("buyerTitle")}
                  </h2>
                </div>
                <div className="flex flex-row items-center">
                  <p className="text-sm text-gray-500">{t("available")}</p>
                  <p className="text-primary">: {crops.length}</p>
                </div>
              </div>
            </div>
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {crops.map((crop: any, index: number) => (
                <CropSelectionCard
                  key={index}
                  icon={crop.icon}
                  title={crop.title}
                  company={crop.company}
                  landAcres={crop.landAcres}
                  deliveryDate={crop.deliveryDate}
                  tag={crop.tag}
                  onSelect={() => handleSelect(crop.title)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="border-red-dark flex flex-row gap-2 rounded-lg border bg-red-200">
            <Info color="#8F0004" className="m-2 size-8" />
            <p className="text-red-dark p-2 text-sm">{t("noBuyers")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
