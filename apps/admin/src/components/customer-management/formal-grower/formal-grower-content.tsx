"use client";

import { Button } from "@cf/ui";
import { format } from "date-fns";
import { Download, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsIsoDate, parseAsString, useQueryStates } from "nuqs";
import React, { useEffect, useMemo, useState } from "react";

import FormalGrowerFilterToolbar from "@/components/customer-management/formal-grower/formal-grower-filter-toolbar";
import FormalGrowerMetricCards from "@/components/customer-management/formal-grower/formal-grower-metric-cards";
import FormalGrowerTable from "@/components/customer-management/formal-grower/formal-grower-table";
import FormalGrowerTableToolbar from "@/components/customer-management/formal-grower/formal-grower-table-toolbar";
import AppTitleToolBar from "@/components/layout/app-title-tool-bar";
import TableLoader from "@/components/skeleton/table-loader";
import { useDebounce } from "@/hooks/use-debounce";
import usePagination from "@/hooks/use-pagingation";
import { useApiClient } from "@/lib/api";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import type { FormalGrowerResponse } from "@/types/formal-grower.types";
import { EXPORT_TYPES } from "@/utils/constants/status-constants";

export default function FormalGrowerContent() {
  const { onOpen } = useModal();
  const { exportType, setExportType } = useTableStore();
  const t = useTranslations("customerManagement.formalGrower");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const api = useApiClient();
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [selectedFilters, setSelectedFilters] = useQueryStates({
    from: parseAsIsoDate,
    to: parseAsIsoDate,
    country: parseAsString.withDefault("all"),
  });

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

  const { data: response, isPending: isLoadingGrowers } = api.useQuery(
    "get",
    "/customer-management/formal-growers",
    {
      params: {
        query: {
          PageNo: pageIndex,
          PageSize: pageSize,
          ...(debouncedSearchTerm !== "" && {
            SearchTerm: debouncedSearchTerm,
          }),
          ...(selectedFilters.from &&
            selectedFilters.to && {
              StartDate: format(selectedFilters.from, "yyyy-MM-dd"),
              EndDate: format(selectedFilters.to, "yyyy-MM-dd"),
            }),
          ...(selectedFilters.country !== "all" && {
            Country: selectedFilters.country,
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

  const growersResponse = response as any as FormalGrowerResponse;
  const growers = growersResponse?.data?.data || [];
  const metadata = growersResponse?.data?.pageData;

  useEffect(() => {
    if (growersResponse?.data?.downloadLink && !isLoadingGrowers) {
      setExportType({
        ...exportType,
        isFilteringData: isLoadingGrowers,
        downloadUrl: growersResponse?.data?.downloadLink,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingGrowers, growersResponse?.data?.downloadLink]);

  return (
    <div>
      <AppTitleToolBar
        title={t("pageTitle")}
        toolBar={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              size="sm"
              onClick={() => {
                onOpen("ExportList", { exportName: "growers" });
              }}
              className="bg-secondary hover:bg-secondary/90 h-10 text-sm text-[#1A5514] sm:h-9"
            >
              <Download size={16} />
              {t("exportButton")}
            </Button>
            <Button
              onClick={() => {
                onOpen("InviteFormalGrower");
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
        <FormalGrowerFilterToolbar
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
      </div>
      <div className={"mt-4"}>
        <FormalGrowerMetricCards selectedFilters={selectedFilters} />
      </div>
      <div className={"mt-8"}>
        {isLoadingGrowers ? (
          <TableLoader />
        ) : (
          <FormalGrowerTable
            data={growers}
            paginateData={{
              pageIndex,
              pagination,
              pageSize,
              currentPage: metadata?.currentPage,
              totalPages: metadata?.totalPages,
              setPagination,
            }}
            toolBar={
              <FormalGrowerTableToolbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
              />
            }
            isFiltering={
              selectedFilters.from !== null ||
              selectedFilters.to !== null ||
              selectedFilters.country !== "all" ||
              selectedStatus !== "all" ||
              debouncedSearchTerm !== ""
            }
          />
        )}
      </div>
    </div>
  );
}
