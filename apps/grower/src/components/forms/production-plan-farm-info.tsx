import { useTranslations } from "next-intl";
import { memo } from "react";

interface FarmInfoSectionProps {
  farmName?: string;
  acreage?: number;
}

export const FarmInfoSection = memo(
  ({ farmName, acreage }: FarmInfoSectionProps) => {
    const t = useTranslations("farmPlan.productionPlan");

    return (
      <>
        <div className="mb-8 rounded-2xl bg-white p-2 shadow-xl lg:p-4">
          <h1 className="text-md mb-2 font-bold">{t("farmInformation")}</h1>
          <p className="text-muted-foreground text-md font-thin">
            {t("farmInformationSubtitle")}
          </p>
        </div>

        <div className="mb-8 flex items-start justify-start gap-6 p-4 md:gap-x-16 xl:gap-24">
          <div className="">
            <span className="text-gray-dark mb-1 block text-sm font-medium">
              {t("farmName")}:
            </span>
            <div className="text-md">{farmName || "-"}</div>
          </div>
          <div className="text-right">
            <span className="text-gray-dark mb-1 block text-sm font-medium">
              {t("farmLandSize")}
            </span>
            <div className="text-md">{acreage ? `${acreage} acres` : "-"}</div>
          </div>
        </div>
      </>
    );
  },
);

FarmInfoSection.displayName = "FarmInfoSection";
