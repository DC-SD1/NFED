"use client";

import { Button } from "@cf/ui";
import { IconLayoutList, IconMap2 } from "@tabler/icons-react";
import { format } from "date-fns";
import { Download, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsIsoDate, parseAsString, useQueryStates } from "nuqs";
import React, { useEffect, useMemo, useState } from "react";

import ContentEmptyState from "@/components/common/content-empty-state";
import AgentFilterToolbar from "@/components/customer-management/agents/agent-filter-toolbar";
import AgentsMetricCards from "@/components/customer-management/agents/agents-metric-cards";
import AgentsTable from "@/components/customer-management/agents/agents-table";
import AgentsTableToolbar from "@/components/customer-management/agents/agents-table-toolbar";
import AppTitleToolBar from "@/components/layout/app-title-tool-bar";
import TableLoader from "@/components/skeleton/table-loader";
import type { Tab } from "@/components/tabs/app-tabs";
import { useDebounce } from "@/hooks/use-debounce";
import usePagination from "@/hooks/use-pagingation";
import { useApiClient } from "@/lib/api";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import type { AgentResponse } from "@/types/agent.types";
import { EXPORT_TYPES } from "@/utils/constants/status-constants";
import { ImageAssets } from "@/utils/image-assets";

export default function AgentsContent() {
  const { onOpen } = useModal();
  const { exportType, setExportType } = useTableStore();
  const t = useTranslations("customerManagement.agents");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFulfillmentCenter, setSelectedFulfillmentCenter] =
    useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const api = useApiClient();
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [selectedFilters, setSelectedFilters] = useQueryStates({
    from: parseAsIsoDate,
    to: parseAsIsoDate,
    country: parseAsString.withDefault("all"),
    region: parseAsString.withDefault("all"),
  });
  const [selectedTab, setSelectedTab] = useState<string>("list-view");

  const [{ pageIndex, pageSize }, setPagination] = usePagination({
    pageIndex: 1,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const { data: response, isPending: isLoadingAgents } = api.useQuery(
    "get",
    "/customer-management/agents",
    {
      params: {
        query: {
          PageNo: pageIndex,
          PageSize: pageSize,
          ...(selectedFilters.from &&
            selectedFilters.to && {
              StartDate: format(selectedFilters.from, "yyyy-MM-dd"),
              EndDate: format(selectedFilters.to, "yyyy-MM-dd"),
            }),
          ...(selectedFilters.country !== "all" && {
            Country: selectedFilters.country,
          }),
          ...(selectedFilters.region !== "all" && {
            Region: selectedFilters.region,
          }),
          ...(debouncedSearchTerm !== "" && {
            SearchTerm: debouncedSearchTerm,
          }),
          ...(selectedFulfillmentCenter !== "all" && {
            FulfillmentCenter: selectedFulfillmentCenter,
          }),
          ...(selectedStatus !== "all" && {
            Status: selectedStatus.toUpperCase(),
          }),
          ...(exportType &&
            exportType?.type === EXPORT_TYPES.itemsMatchingAppliedFilters && {
              Export: true,
            }),
        },
      },
    },
    {
      throwOnError: true,
    },
  );

  const agentResponse = response as any as AgentResponse;
  const agents = agentResponse?.data?.data || [];
  const metadata = agentResponse?.data?.pageData;

  useEffect(() => {
    if (agentResponse?.data?.downloadLink && !isLoadingAgents) {
      setExportType({
        ...exportType,
        isFilteringData: isLoadingAgents,
        downloadUrl: agentResponse?.data?.downloadLink,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingAgents, agentResponse?.data?.downloadLink]);

  const isFiltering =
    selectedFilters.from !== null ||
    selectedFilters.to !== null ||
    selectedFilters.country !== "all" ||
    selectedFilters.region !== "all" ||
    selectedStatus !== "all" ||
    selectedFulfillmentCenter !== "all" ||
    debouncedSearchTerm !== "";

  const tabs: Tab[] = [
    {
      label: t("tabs.listView"),
      value: "list-view",
      icon: IconLayoutList,
      content: (
        <AgentsTable
          data={agents}
          paginateData={{
            pageIndex,
            pagination,
            pageSize,
            currentPage: metadata?.currentPage,
            totalPages: metadata?.totalPages,
            setPagination,
          }}
        />
      ),
    },
    {
      label: t("tabs.mapView"),
      value: "map-view",
      icon: IconMap2,
      content: (
        <div className={"py-8"}>
          <h1 className={"text-center text-4xl"}>Map view</h1>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AppTitleToolBar
        title={t("pageTitle")}
        toolBar={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              size="sm"
              onClick={() => {
                onOpen("ExportList", { exportName: "agents" });
              }}
              className="bg-secondary hover:bg-secondary/90 h-10 text-sm text-[#1A5514] sm:h-9"
            >
              <Download size={16} />
              {t("exportButton")}
            </Button>
            <Button
              onClick={() => {
                onOpen("InviteAgent", { belongsTo: "agent" });
              }}
              size="sm"
              className="h-10 text-sm sm:h-9"
            >
              <Plus size={16} />
              {t("inviteUserButton")}
            </Button>
          </div>
        }
      />
      <div className={"mt-5"}>
        <AgentFilterToolbar
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
      </div>
      <div className={"mt-4"}>
        <AgentsMetricCards selectedFilters={selectedFilters} />
      </div>
      <div className={"mt-8"}>
        {isLoadingAgents ? (
          <TableLoader />
        ) : (
          <div>
            {!isFiltering && agents.length === 0 ? (
              <div
                className={
                  "flex h-72 flex-col items-center justify-center sm:h-96"
                }
              >
                <ContentEmptyState
                  imgSrc={ImageAssets.USERS_SQUARE}
                  title={t("emptyState.title")}
                  message={t("emptyState.description")}
                />
              </div>
            ) : (
              <div className={"flex flex-col gap-4"}>
                <AgentsTableToolbar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedFulfillmentCenter={selectedFulfillmentCenter}
                  setSelectedFulfillmentCenter={setSelectedFulfillmentCenter}
                  tabs={tabs}
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                />
                {tabs.find((tab) => tab.value === selectedTab)?.content ?? (
                  <></>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
