import type { components } from "@cf/api";
import React, { useMemo } from "react";

import MaterialCard from "./material-card";

type BOMItem = components["schemas"]["PhysicsBasedBOMItem"];

interface MaterialItem {
  name: string;
  details: string;
  amount: string;
  cost: string;
  category: "Nursery" | "IMP" | "Seed" | "Soil" | "Fertilizer";
  notes?: string;
}

interface MaterialRequirementsProps {
  bom: BOMItem[];
}

const MaterialRequirements: React.FC<MaterialRequirementsProps> = ({ bom }) => {
  const totalCost = useMemo(() => {
    const total = bom.reduce((sum, item) => {
      const cost = parseFloat(item.cost_ghs ?? "0");
      return sum + cost;
    }, 0);
    return `GH₵ ${total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [bom]);

  const materials: MaterialItem[] = useMemo(
    () =>
      bom.map((item) => ({
        name: item.item ?? "Unknown",
        details: `${item.quantity ?? "0"} ${item.unit ?? ""}`.trim(),
        amount: `GH₵ ${item.cost_ghs ?? "0"}`,
        cost: `GH₵ ${item.cost_ghs ?? "0"}`,
        category: (item.category ?? "Fertilizer") as MaterialItem["category"],
        notes: item.notes ?? undefined,
      })),
    [bom],
  );

  return (
    <div>
      {/* Header */}
      <div className=" px-6 py-2">
        <div className="flex flex-col  ">
          <div className="mb-2 flex flex-row items-center gap-2">
            <h2 className="text-md  font-semibold">Material Requirements</h2>
            <span className="flex size-5 items-center justify-center rounded-full bg-black text-xs font-thin text-white">
              {bom.length}
            </span>
          </div>
          <p className="font-semibold text-primary">
            Total Material Cost: {totalCost}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {materials.map((material, index) => (
          <MaterialCard
            key={index}
            name={material.name}
            details={material.details}
            cost={material.cost}
            category={material.category}
            notes={material.notes}
            categoryColors="bg-blue-light text-blue-dark"
          />
        ))}
      </div>
    </div>
  );
};

export default MaterialRequirements;
