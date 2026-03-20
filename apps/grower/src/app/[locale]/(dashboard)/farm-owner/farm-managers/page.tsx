"use client";

import { Avatar, AvatarFallback } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import {
  AssignedFarmManagersIcon,
  RemovedFarmManagerIcon,
  TotalFarmManagersIcon,
  UnassignedFarmManagersIcon,
} from "@cf/ui/icons";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

import experiencedImage from "@/assets/images/experienced.png";
import EmptyStateWrapper from "@/components/dashboard/empty-state-wrapper";
import TableServer from "@/components/dashboard/farm-manager-table.tsx/manager-listing";
import { MobileManagerTable } from "@/components/dashboard/farm-manager-table.tsx/mobile-data-table";
import ManagerStateSkeletonWrapper from "@/components/dashboard/skeletons/empty-manager-state-skeleton";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import {
  getContractStatusDisplay,
  getPaymentTypeDisplay,
  getWorkTypeDisplay,
  mapFarmManagerToTableRow,
} from "@/utils/mapping-helper";

const StartPage = () => {
  const t = useTranslations("dashboard.emptyState");
  const { onOpen } = useModal();
  const isMobile = useIsMobile();
  const api = useApiClient();
  const { userId: authUserId } = useAuthUser();
  const [exportClicked, setExportClicked] = useState(false);

  const [activeFilter, setActiveFilter] = useQueryState(
    "managerFilter",
    parseAsStringEnum([
      "All",
      "Assigned",
      "Not assigned",
      "Draft",
      "Deactivated",
    ]).withDefault("All"),
  );

  useEffect(() => {
    const resetHandler = () => setExportClicked(false);
    window.addEventListener("reset-export-clicked", resetHandler);
    return () =>
      window.removeEventListener("reset-export-clicked", resetHandler);
  }, []);

  const { data: response, isLoading } = api.useQuery(
    "get",
    "/users/farm-managers/{FarmOwnerId}",
    {
      params: {
        path: { FarmOwnerId: authUserId! },
      },
    },
    {
      enabled: !!authUserId,
      retry: (failureCount, error) => {
        if (error && "status" in error && error.status === 401) return false;
        return failureCount < 3;
      },
    },
  );

  if (isLoading) return <ManagerStateSkeletonWrapper />;

  const mappedManagers =
    response?.isSuccess && response.value?.farmManagers
      ? mapFarmManagerToTableRow(response.value.farmManagers)
      : [];

  const withStatus = mappedManagers.map((row) => {
    const status = getContractStatusDisplay(row.contract?.contractStatus);
    const displayPayType = getPaymentTypeDisplay(row.contract?.paymentType);
    const displayWorkType = getWorkTypeDisplay(row.contract?.contractType);
    return {
      ...row,
      status,
      displayPayType,
      displayWorkType,
      uiBadge: <StatusBadge status={status} />,
      uiItem: (
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary-darkest text-primary-lightest text-sm">
            {row.displayName[0]}
          </AvatarFallback>
        </Avatar>
      ),
    };
  });

  const filteredManagers =
    activeFilter === "All"
      ? withStatus
      : withStatus.filter(
          (m) => m.status.toLowerCase() === activeFilter.toLowerCase(),
        );

  const farmManagerStats = [
    {
      title: t("totalManagers"),
      count: withStatus.length,
      icon: <TotalFarmManagersIcon />,
      bgColor: "bg-green-100",
    },
    {
      title: t("assignedManagers"),
      count: withStatus.filter((m) => m.status.toLowerCase() === "assigned")
        .length,
      icon: <AssignedFarmManagersIcon />,
      bgColor: "bg-green-100",
    },
    {
      title: t("unassignedManagers"),
      count: withStatus.filter((m) => m.status.toLowerCase() === "not assigned")
        .length,
      icon: <UnassignedFarmManagersIcon />,
      bgColor: "bg-orange-100",
    },
    {
      title: t("removedManagers"),
      count: withStatus.filter((m) => m.status.toLowerCase() === "deactivated")
        .length,
      icon: <RemovedFarmManagerIcon />,
      bgColor: "bg-red-100",
    },
  ];

  const handleFilterChange = (value: string) => setActiveFilter(value as any);
  const handleAddFarmManager = () => onOpen("AddFarmManager");
  const handleExport = () => setExportClicked(true);

  return (
    <EmptyStateWrapper
      title={t("layoutTitle")}
      addButtonText={t("addFarmManager")}
      statCards={farmManagerStats.map((card) => ({
        ...card,
        className: "xs:col-span-1 sm:col-span-2 md:col-span-1",
      }))}
      filterTabs={["All", "Assigned", "Not assigned", "Draft", "Deactivated"]}
      activeFilter={activeFilter}
      onFilterChange={handleFilterChange}
      onAddClick={handleAddFarmManager}
      onExportClick={handleExport}
    >
      <div className="mb-24 items-center px-2 xl:mb-0">
        {filteredManagers.length > 0 ? (
          isMobile ? (
            <MobileManagerTable data={filteredManagers} />
          ) : (
            <TableServer
              key={activeFilter}
              data={filteredManagers}
              pageCount={Math.ceil(filteredManagers.length / 5)}
              showDraftColumns={activeFilter === "Draft"}
              exportClicked={exportClicked}
              activeFilter={activeFilter}
            />
          )
        ) : (
          <div className="flex min-h-[400px] items-center justify-center p-2 ">
            <div className="w-full max-w-md space-y-8 text-center">
              <div className="flex justify-center">
                <Image
                  src={experiencedImage}
                  alt="Experienced"
                  width={100}
                  height={100}
                  className="rounded-md object-contain"
                />
              </div>
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("title")}
                </h1>
                <p className="text-base leading-relaxed text-gray-600">
                  {t("description")}
                </p>
              </div>
              <Button
                onClick={handleAddFarmManager}
                className="bg-primary w-full rounded-2xl px-6 py-3 font-medium text-white"
              >
                {t("addFarmManager")}
                <Plus className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </EmptyStateWrapper>
  );
};

export default StartPage;
