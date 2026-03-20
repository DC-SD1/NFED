import { Card, CardContent } from "@cf/ui";
import { Sprout, TreePine, Wheat } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface FarmStatusCardProps {
  status: "unassigned" | "assigned" | "active";
  farmName?: string;
  growerName?: string;
  description?: string;
  illustration?: React.ReactNode;
  className?: string;
}

export function FarmStatusCard({
  status,
  farmName,
  growerName,
  description,
  illustration,
  className,
}: FarmStatusCardProps) {
  const { t } = useTranslation();

  const defaultIllustration = (
    <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gradient-to-b from-green-50 to-green-100">
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2 p-4">
        <TreePine className="h-8 w-6 text-green-600" />
        <Wheat className="h-6 w-5 text-yellow-600" />
        <TreePine className="h-10 w-8 text-green-700" />
        <Sprout className="size-4 text-green-500" />
        <TreePine className="h-7 w-6 text-green-600" />
      </div>
    </div>
  );

  const titles = {
    unassigned: t("farm.statusCard.unassignedTitle"),
    assigned: farmName || t("farm.statusCard.assignedTitle"),
    active: farmName || t("farm.statusCard.activeTitle"),
  };

  const descriptions = {
    unassigned: description || t("farm.statusCard.unassignedDescription"),
    assigned:
      description ||
      t("farm.statusCard.assignedDescription", {
        grower: growerName || t("farm.statusCard.defaultGrower"),
      }),
    active:
      description ||
      t("farm.statusCard.activeDescription", {
        farm: farmName || t("farm.statusCard.defaultFarm"),
      }),
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        {illustration || defaultIllustration}

        <h3 className="mt-4 text-lg font-semibold">{titles[status]}</h3>

        <p className="text-muted-foreground mt-2 text-sm">
          {descriptions[status]}
        </p>
      </CardContent>
    </Card>
  );
}
function useTranslation(): { t: any } {
  throw new Error("Function not implemented.");
}
