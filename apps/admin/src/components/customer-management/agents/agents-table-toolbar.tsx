"use client";

import { Badge, Button } from "@cf/ui";
import { IconUserPlus } from "@tabler/icons-react";
import { RefreshCw, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import PrimaryButton from "@/components/buttons/primary-button";
import ContentViewTab from "@/components/customer-management/agents/content-view-tab";
import DropdownComponent from "@/components/input-components/dropdown-component";
import InputComponent from "@/components/input-components/input-component";
import { QuerySearchableDropdown } from "@/components/input-components/query-searchable-dropdown";
import type { Tab } from "@/components/tabs/app-tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { useApiClient } from "@/lib/api";
import useTableStore from "@/lib/stores/table-store/table-store";
import { STATUSES } from "@/utils/constants/status-constants";

const STATUS_OPTIONS = [
  {
    label: "All statuses",
    value: "all",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Suspended",
    value: "suspended",
  },
  {
    label: "Pending suspension",
    value: "pending suspension",
  },
  {
    label: "Deactivated",
    value: "deactivated",
  },
];

interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: React.SetStateAction<string>) => void;
  selectedFulfillmentCenter: string;
  setSelectedFulfillmentCenter: (value: React.SetStateAction<string>) => void;
  tabs: Tab[];
  selectedTab: string;
  setSelectedTab: (value: React.SetStateAction<string>) => void;
}

export default function AgentsTableToolbar({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedFulfillmentCenter,
  setSelectedFulfillmentCenter,
  tabs,
  selectedTab,
  setSelectedTab,
}: Props) {
  const { rows, clearRows } = useTableStore();
  const t = useTranslations("customerManagement.agents.filters");
  const api = useApiClient();
  const [centerSearchTerm, setCenterSearchTerm] = useState("");
  const debounceSearchTerm = useDebounce(centerSearchTerm);

  const { data: response, isPending: isLoadingCenters } = api.useQuery(
    "get",
    "/fulfillment-centers",
    {
      params: {
        query: {
          PageNo: 1,
          PageSize: 20,
          ...(debounceSearchTerm !== "" && {
            SearchTerm: debounceSearchTerm,
          }),
        },
      },
    },
  );

  const fulfilmentCenters = [
    { value: "all", label: "All fulfilment centers" },
    ...(response?.data?.data ?? []).map((item) => ({
      label: item.name ?? "",
      value: item.name ?? "",
    })),
  ];

  const handleResetToolbar = () => {
    clearRows();
  };

  const handleRemoveFilter = (field: "center" | "status") => {
    if (field === "center") {
      setSelectedFulfillmentCenter("all");
    } else if (field === "status") {
      setSelectedStatus("all");
    }
  };

  return (
    <>
      {rows.length === 0 ? (
        <div className={"flex items-center justify-between"}>
          <div
            className={
              "flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2"
            }
          >
            <div>
              <InputComponent
                key={"searchTerm"}
                type="search"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
                placeholder={t("searchPlaceholder")}
                className={"min-w-[22rem] rounded-full"}
                left={<Search className={"size-4"} />}
              />
            </div>
            <div>
              {selectedFulfillmentCenter === "all" ? (
                <QuerySearchableDropdown
                  className={"rounded-full"}
                  contentClassName={"min-w-64"}
                  searchOuterClassName={"rounded-full"}
                  defaultValue={selectedFulfillmentCenter}
                  onValueChange={(option) => {
                    setSelectedFulfillmentCenter(option.value);
                  }}
                  options={fulfilmentCenters}
                  placeholder={
                    isLoadingCenters && centerSearchTerm === ""
                      ? "Loading..."
                      : t("selectFulfillmentCenter")
                  }
                  searchPlaceholder={t("selectFulfillmentCenter")}
                  searchTerm={centerSearchTerm}
                  isSearchLoading={isLoadingCenters}
                  onSearchTerm={(value) => setCenterSearchTerm(value)}
                />
              ) : (
                <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
                  <span className="truncate capitalize">
                    {selectedFulfillmentCenter}
                  </span>
                  <button
                    onClick={() => handleRemoveFilter("center")}
                    className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
                  >
                    <X className="size-3 text-white" />
                  </button>
                </Badge>
              )}
            </div>
            <div>
              {selectedStatus === "all" ? (
                <DropdownComponent
                  className={"rounded-full"}
                  defaultValue={selectedStatus}
                  options={STATUS_OPTIONS}
                  placeholder={t("selectStatus")}
                  contentClassName={"min-w-48"}
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                  }}
                />
              ) : (
                <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
                  <span className="capitalize">{selectedStatus}</span>
                  <button
                    onClick={() => handleRemoveFilter("status")}
                    className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
                  >
                    <X className="size-3 text-white" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
          <ContentViewTab
            tabs={tabs}
            defaultValue={selectedTab}
            onChange={setSelectedTab}
          />
        </div>
      ) : (
        <div className="flex w-full items-center justify-between gap-4">
          <div className={"flex items-center gap-2"}>
            {selectedStatus.toLowerCase() === STATUSES.deactivated && (
              <PrimaryButton
                variant={"secondary"}
                size="sm"
                className={"text-primary text-sm font-semibold"}
                buttonContent={
                  <>
                    <IconUserPlus className={"size-4"} />
                    {t("requestToReactivate")}
                  </>
                }
              />
            )}
          </div>
          <Button
            onClick={handleResetToolbar}
            variant={"secondary"}
            size="sm"
            className={"text-sm font-semibold text-[#1A5514]"}
          >
            <RefreshCw className={"size-4"} />
            {t("resetToolbar")}
          </Button>
        </div>
      )}
    </>
  );
}
