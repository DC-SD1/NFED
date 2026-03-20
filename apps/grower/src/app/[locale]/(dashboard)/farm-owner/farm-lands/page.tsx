"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { parseAsStringEnum, useQueryState } from "nuqs";

import EmptyStateWrapper from "@/components/dashboard/empty-state-wrapper";
import FarmLandItems from "@/components/dashboard/farm-land-cards/farm-land-items";
import { useFarmMetrics } from "@/components/dashboard/farm-land-cards/metrics-card";
import { FARM_STATUS_FILTERS } from "@/utils/farm-api-helpers";

const FarmLandsPage = () => {
  const router = useRouter();
  const t = useTranslations("dashboard.farmManager.emptyState");

  const { farmManagerStats, isLoading } = useFarmMetrics();

  // Extract filter labels from canonical source
  const filterLabels = FARM_STATUS_FILTERS.map((filter) => filter.label);

  const [activeFilter, setActiveFilter] = useQueryState(
    "landFilter",
    parseAsStringEnum(filterLabels).withDefault("All"),
  );

  const handleAdd = () => {
    router.push("/farm-owner/farm-lands/add");
  };
  const handleFilterChange = (value: string) => setActiveFilter(value as any);

  return (
    <EmptyStateWrapper
      title={t("title")}
      addButtonText={t("addFarmLand")}
      onAddClick={handleAdd}
      isLoading={isLoading}
      statCards={farmManagerStats.map((card) => ({
        ...card,
        className: "xs:col-span-1 sm:col-span-2 md:col-span-1",
      }))}
      filterTabs={filterLabels}
      activeFilter={activeFilter}
      onFilterChange={handleFilterChange}
    >
      <FarmLandItems activeFilter={activeFilter} />
    </EmptyStateWrapper>
  );
};

export default FarmLandsPage;
