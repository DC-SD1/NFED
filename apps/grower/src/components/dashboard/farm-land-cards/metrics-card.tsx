"use client";

import {
  DeleteMapIcon,
  FarmMapIcon,
  PlantIcon,
  SeedingIcon,
} from "@cf/ui/icons";
import { useTranslations } from "next-intl";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";

export const useFarmMetrics = () => {
  const api = useApiClient();
  const { userId: authUserId } = useAuthUser();
  const t = useTranslations("dashboard.farmManager.emptyState");

  const {
    data: response,
    isLoading,
    error,
  } = api.useQuery(
    "post",
    "/farm-management/get-farm-metrics",
    {
      body: { farmOwnerId: authUserId || "" },
    },
    {
      enabled: !!authUserId,
      retry: (failureCount, error) => {
        if (error && "status" in error && error.status === 401) return false;
        return failureCount < 3;
      },
    },
  );

  const getCountByStatus = (status: string): number => {
    if (!response) return 0;
    const statusData = response.find((item: any) => item.status === status);
    return statusData?.count || 0;
  };

  const getTotalFarmLands = (): number => {
    if (!response) return 0;
    return response.reduce(
      (total: number, item: any) => total + (item.count || 0),
      0,
    );
  };

  const farmManagerStats = [
    {
      title: t("totalFarmLands"),
      count: getTotalFarmLands(),
      icon: <FarmMapIcon />,
      bgColor: "bg-green-100",
    },
    {
      title: t("plantingFarmLands"),
      count: getCountByStatus("Planting"),
      icon: <SeedingIcon />,
      bgColor: "bg-green-100",
    },
    {
      title: t("harvestingFarmLands"),
      count: getCountByStatus("Harvesting"),
      icon: <PlantIcon />,
      bgColor: "bg-green-100",
    },
    {
      title: t("deactivatedFarmLands"),
      count: getCountByStatus("Inactive") + getCountByStatus("Archived"),
      icon: <DeleteMapIcon />,
      bgColor: "bg-red-100",
    },
  ];

  return {
    farmManagerStats,
    isLoading,
    error,
    response,
  };
};
