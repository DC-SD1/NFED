import type { components } from "@cf/api";
import React, { useMemo } from "react";

import { usePlantingWindow } from "@/hooks/use-planting-window";
import { useFarmLandsDetail } from "@/lib/queries/farm-land-query";

import ResultsCard from "./results-card";

type FarmPlanDto = components["schemas"]["FarmPlanDto"];

interface FarmDetailsComponentProps {
  plan: FarmPlanDto;
}
interface CropInfoItem {
  label: string;
  value: string;
  isTarget?: boolean;
}

const FarmDetailsComponent = ({ plan }: FarmDetailsComponentProps) => {
  // Fetch farm details to get location for planting window analysis
  const { farmLandDetailsData: farmDetails } = useFarmLandsDetail(plan.farmId);

  // Fetch planting window analysis using the hook
  const { isAnalyzing, showResults, analysisResults } = usePlantingWindow({
    cropVariety: plan.cropVariety || "",
    farmDetails: farmDetails ?? null,
    cropId: plan.cropId,
    enabled: Boolean(plan.cropId && plan.cropVariety && farmDetails),
  });

  const costBreakdown = useMemo(() => {
    const formatCost = (value: string | number | undefined | null): string => {
      if (value === null || value === undefined) return "0.00";
      const num = typeof value === "string" ? parseFloat(value) : value;
      return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    return (plan.budget ?? []).map((item) => ({
      item: item.category ?? "Unknown",
      cost: `GH₵ ${formatCost(item.category_cost_ghs)}`,
    }));
  }, [plan.budget]);

  const maxDAT = useMemo(() => {
    const dats = (plan.schedule ?? [])
      .map((s) => s.DAT ?? 0)
      .filter((dat) => dat > 0);
    return dats.length > 0 ? Math.max(...dats) : 0;
  }, [plan.schedule]);

  const productionTimeline = useMemo(
    () => [
      {
        item: "Season duration",
        value: `${maxDAT} days`,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
      },
      {
        item: "Total Activities",
        value: (plan.schedule?.length ?? 0).toString(),
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
      },
      {
        item: "Material items",
        value: (plan.bom?.length ?? 0).toString(),
        bgColor: "bg-purple-100",
        textColor: "text-purple-700",
      },
    ],
    [plan.schedule, plan.bom, maxDAT],
  );

  const cropInfo = useMemo<CropInfoItem[]>(() => {
    const summary = plan.summary;
    // const waterDemandMet =
    //   parseFloat(summary?.avg_water_demand_met ?? "0") * 100;

    // const formatNumber = (
    //   value: string | number | undefined | null,
    //   decimals = 2,
    // ): string => {
    //   if (value === null || value === undefined) return "N/A";
    //   const num = typeof value === "string" ? parseFloat(value) : value;
    //   return isNaN(num) ? "N/A" : num.toFixed(decimals);
    // };

    return [
      { label: "Variety:", value: plan.cropVariety ?? "N/A" },
      // TODo: Add back when protocol API is updated
      // {
      //   label: "Expected Yield:",
      //   value: `${formatNumber(summary?.predicted_yield_t_ha)} tons/ha`,
      // },
      // {
      //   label: "Water Stress Days:",
      //   value: `${summary?.total_stress_days ?? 0} days`,
      // },
      // {
      //   label: "Water Demand Met:",
      //   value: `${waterDemandMet.toFixed(1)}%`,
      // },
      {
        label: "Plant Population:",
        value: `${summary?.plants?.toLocaleString() ?? "N/A"} plants`,
      },
      // {
      //   label: "Heating Units Range:",
      //   value: `${formatNumber(summary?.predicted_SHU_95pct_low, 0)} - ${formatNumber(summary?.predicted_SHU_95pct_high, 0)}`,
      // },
      // {
      //   label: "Total Water Demand:",
      //   value: `${formatNumber(summary?.total_unmet_demand_mm)} mm`,
      // },
      // {
      //   label: "Heating Units Target:",
      //   value: summary?.SHU_within_target ? "Within Target" : "Outside Target",
      //   isTarget: true,
      // },
    ];
  }, [plan]);

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Cost Breakdown */}
        <div>
          <h2 className="text-md mb-4 font-semibold">Cost breakdown</h2>
          <div className="space-y-3">
            {costBreakdown.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-2xl bg-userDropdown-background p-4"
              >
                <span className="font-light">{item.item}</span>
                <span className="font-light">{item.cost}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Production Timeline */}
        <div>
          <h1 className="text-md mb-4 font-semibold">Production timeline</h1>
          <div className="space-y-3">
            {productionTimeline.map((item, index) => (
              <div
                key={index}
                className={`${item.bgColor} flex items-center justify-between rounded-2xl p-4`}
              >
                <span className="text-gray-700">{item.item}</span>
                <span className={`font-bold ${item.textColor}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 mt-8 rounded-2xl bg-userDropdown-background p-4">
        <h2 className="text-md mb-4 font-semibold">
          Crop-specific Information
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {cropInfo.map((info, index) => (
            <div key={index} className="flex flex-row gap-1 ">
              <span className="text-gray-dark">{info.label}</span>
              <span
                className={` ${info.isTarget ? "font-semibold text-primary" : "font-thin "}`}
              >
                {info.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Planting Window Analysis */}
      {isAnalyzing && (
        <div className="rounded-2xl bg-userDropdown-background p-4">
          <p className="text-sm text-gray-dark">
            Loading planting window analysis...
          </p>
        </div>
      )}
      {showResults && analysisResults && (
        <ResultsCard
          results={analysisResults}
          variant="warning"
          title="Planting Recommendation"
        />
      )}
    </>
  );
};

export default FarmDetailsComponent;
