import type { paths } from "@cf/api";
import { cn } from "@cf/ui";
import { useTranslations } from "next-intl";

import { useNutrientSelection } from "@/hooks/use-nutrient-selection";
import type { NutrientKey } from "@/lib/constants/nutrient-configs";
import {
  getNutrientDisplayName,
  NUTRIENT_CONFIGS,
} from "@/lib/constants/nutrient-configs";
import { statusFromRawValue } from "@/lib/utils/map-soil-analysis";
import { formatDisplayValue } from "@/utils/mapping-helper";

import StatusCard from "./status-card";

type SoilAnalysis =
  paths["/crop-management/get-soil-analysis"]["post"]["responses"]["200"]["content"]["application/json"];

interface Props {
  soilAnalysis?: SoilAnalysis | null;
}

export default function SoilProfileCard({ soilAnalysis }: Props) {
  const t = useTranslations("FarmLands.farmDetails");
  const { selectNutrient, isSelected } = useNutrientSelection();
  // Build dynamic nutrient cards from soilAnalysis.soilProfile
  const profile = soilAnalysis?.soilProfile?.properties;

  const toDisplayValue = (
    key: NutrientKey,
    raw: number | null | undefined,
  ): { value: string; unit?: string } => {
    if (raw == null) return { value: "-" };
    // unit conversion for nitrogen and organic matter
    if (key === "nitrogen") {
      const pct = raw / 10; // g/kg -> %
      return { value: pct.toFixed(2), unit: "%" };
    }
    if (key === "organicMatter") {
      const ocPercent = (raw / 10) * 1.724; // g/kg -> % -> OM%
      return { value: ocPercent.toFixed(2), unit: "%" };
    }
    const unit = NUTRIENT_CONFIGS[key].unit;
    return { value: String(raw), unit };
  };

  const buildItem = (key: NutrientKey, propKey: string) => {
    const val = (profile as any)?.[propKey]?.value as number | undefined;
    const { value, unit } = toDisplayValue(key, val);
    // Calculate the transformed value for status determination
    const statusValue =
      key === "nitrogen" && val != null
        ? val / 10
        : key === "organicMatter" && val != null
          ? (val / 10) * 1.724
          : val;

    return {
      nutrientKey: key,
      title: getNutrientDisplayName(key),
      value,
      unit,
      status:
        statusValue != null ? statusFromRawValue(key, statusValue) : "unknown",
    } as const;
  };

  const items = [
    buildItem("phosphorus", "phosphorous_extractable"),
    buildItem("potassium", "potassium_extractable"),
    buildItem("ph", "ph"),
    buildItem("calcium", "calcium_extractable"),
    buildItem("magnesium", "magnesium_extractable"),
    buildItem("iron", "iron_extractable"),
    buildItem("manganese", "manganese_extractable"),
    buildItem("boron", "boron_extractable"),
    buildItem("copper", "copper_extractable"),
    buildItem("zinc", "zinc_extractable"),
    buildItem("nitrogen", "nitrogen_total"),
    buildItem("organicMatter", "carbon_organic"),
    buildItem("cec", "cation_exchange_capacity"),
  ];

  const extra = [
    {
      nutrientKey: null,
      title: "C/N Ratio",
      value: "-",
      status: undefined,
    },
    {
      nutrientKey: null,
      title: "Soil Texture",
      value: String((profile as any)?.texture_class?.value ?? "-"),
      status: undefined,
    },
  ];

  const cards = items.concat(extra as any);

  return (
    <div className=" w-full rounded-lg border-none bg-white px-2 pt-4 md:px-6">
      <h2
        className={cn(
          "text-md mb-2 leading-none text-gray-dark",
          soilAnalysis && "font-semibold",
        )}
      >
        {t("soilProfileTitle")}
      </h2>
      {!soilAnalysis && (
        <p className="text-md pb-2 font-normal leading-tight">{"pending"}</p>
      )}

      {soilAnalysis && (
        <>
          {/* {" "}
          <Card className="bg-primary-bright border-green-100">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary-darkest text-md font-semibold">
                  {t("fertilitySummary")}
                </CardTitle>
                <div className="text-2xl">
                  <Smile className="text-primary" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="leading-relaxed">
                Based on your soil test results, your farm land is good for
                farming. Below are the nutrients to watch that can limit your
                yields.
              </p>

              <p className="leading-relaxed ">
                <span className="text-primary-semi font-semibold">Calcium</span>{" "}
                and{" "}
                <span className="text-primary-semi font-semibold">
                  Total Nitrogen
                </span>{" "}
                are the major nutrients that are likely to be limiting your
                yields.
              </p>

              <p className="leading-relaxed ">
                <span className="text-primary-semi  font-semibold">Baron</span>{" "}
                is the micro-nutrient that is likely to be limiting your yields.
              </p>
            </CardContent>
          </Card> */}
          <h1 className="text-md mt-6 font-bold">{t("soilFertilityStatus")}</h1>
          <p>{t("fertilityDescription")}</p>
          <div className="sm:2 mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-3">
            {cards.map((item: any, index: number) => (
              <StatusCard
                key={index}
                title={item.title}
                value={formatDisplayValue(item.value)}
                unit={item.unit}
                status={item.status}
                onClick={
                  item.nutrientKey
                    ? () => selectNutrient(item.nutrientKey)
                    : undefined
                }
                isSelected={
                  item.nutrientKey ? isSelected(item.nutrientKey) : false
                }
                interactive={!!item.nutrientKey}
                className="rounded-lg shadow-lg"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
