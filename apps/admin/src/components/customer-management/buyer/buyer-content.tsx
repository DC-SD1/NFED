"use client";

import { Button } from "@cf/ui";
import { Download, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsIsoDate, parseAsString, useQueryStates } from "nuqs";
import React, { useEffect, useMemo, useState } from "react";

import BuyerFilterToolbar from "@/components/customer-management/buyer/buyer-filter-toolbar";
import BuyerMetricCards from "@/components/customer-management/buyer/buyer-metric-cards";
import BuyerTable from "@/components/customer-management/buyer/buyer-table";
import BuyerTableToolbar from "@/components/customer-management/buyer/buyer-table-toolbar";
import { MockDataToggle } from "@/components/dev/mock-data-toggle";
import AppTitleToolBar from "@/components/layout/app-title-tool-bar";
import TableLoader from "@/components/skeleton/table-loader";
import { useDebounce } from "@/hooks/use-debounce";
import usePagination from "@/hooks/use-pagingation";
import { MOCK_BUYERS } from "@/lib/constants/mock_data";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import type { Buyer } from "@/types/buyer.types";

export default function BuyerContent() {
  const { onOpen } = useModal();
  const { exportType, setExportType } = useTableStore();
  const t = useTranslations("customerManagement.buyer");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedComplianceStatus, setSelectedComplianceStatus] =
    useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [selectedFilters, setSelectedFilters] = useQueryStates({
    from: parseAsIsoDate,
    to: parseAsIsoDate,
    country: parseAsString.withDefault("all"),
  });

  const [useMockData, setUseMockData] = useState(false);

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

  const isLoadingBuyers = false;
  const buyersResponse: any = undefined;

  const filteredMockBuyers = useMemo(() => {
    if (!useMockData) return [];

    return MOCK_BUYERS.filter((buyer) => {
      // Filter by search term
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch =
          buyer.buyerName.toLowerCase().includes(searchLower) ||
          buyer.email.toLowerCase().includes(searchLower) ||
          buyer.organisationId?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filter by country
      if (selectedFilters.country !== "all") {
        if (buyer.country !== selectedFilters.country) return false;
      }

      // Filter by status
      if (selectedStatus !== "all") {
        if (buyer.status.toLowerCase() !== selectedStatus.toLowerCase())
          return false;
      }

      // Filter by compliance
      if (selectedComplianceStatus !== "all") {
        if (buyer.compliance !== selectedComplianceStatus) return false;
      }

      // Filter by date range
      if (selectedFilters.from || selectedFilters.to) {
        const buyerDate = new Date(buyer.createdAt);
        if (selectedFilters.from && buyerDate < selectedFilters.from)
          return false;
        if (selectedFilters.to && buyerDate > selectedFilters.to) return false;
      }

      return true;
    });
  }, [
    useMockData,
    debouncedSearchTerm,
    selectedFilters.country,
    selectedFilters.from,
    selectedFilters.to,
    selectedStatus,
    selectedComplianceStatus,
  ]);

  const buyers = useMockData
    ? filteredMockBuyers
    : (buyersResponse?.data?.data as Buyer[]) || [];
  const metadata = useMockData
    ? {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalItems: filteredMockBuyers.length,
      }
    : buyersResponse?.data?.pageData || {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalItems: 0,
      };

  useEffect(() => {
    if (buyersResponse?.data?.downloadLink && !isLoadingBuyers) {
      setExportType({
        ...exportType,
        isFilteringData: isLoadingBuyers,
        downloadUrl: buyersResponse?.data?.downloadLink,
      });
    }
  }, [
    isLoadingBuyers,
    buyersResponse?.data?.downloadLink,
    exportType,
    setExportType,
  ]);

  return (
    <div>
      <AppTitleToolBar
        title={t("pageTitle")}
        toolBar={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {useMockData && (
              <MockDataToggle
                enabled={useMockData}
                onToggle={() => setUseMockData(!useMockData)}
                showBadgeOnly
              />
            )}
            <Button
              size="sm"
              onClick={() => {
                onOpen("ExportList", { exportName: "buyers" });
              }}
              className="h-10 bg-secondary text-sm text-[#1A5514] hover:bg-secondary/90 sm:h-9"
            >
              <Download size={16} />
              {t("exportButton")}
            </Button>
            <Button
              onClick={() => {
                onOpen("InviteBuyer");
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
      <MockDataToggle
        enabled={useMockData}
        onToggle={() => setUseMockData(!useMockData)}
      />
      <div className={"mt-5"}>
        <BuyerFilterToolbar
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
      </div>
      <div className={"mt-4"}>
        <BuyerMetricCards />
      </div>
      <div className={"mt-8"}>
        {isLoadingBuyers ? (
          <TableLoader />
        ) : (
          <BuyerTable
            data={buyers}
            paginateData={{
              pageIndex,
              pagination,
              pageSize,
              currentPage: metadata?.currentPage,
              totalPages: metadata?.totalPages,
              setPagination,
            }}
            toolBar={
              <BuyerTableToolbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedComplianceStatus={selectedComplianceStatus}
                setSelectedComplianceStatus={setSelectedComplianceStatus}
              />
            }
            isFiltering={
              selectedFilters.country !== "all" ||
              selectedStatus !== "all" ||
              selectedComplianceStatus !== "all" ||
              debouncedSearchTerm !== ""
            }
            useMockData={useMockData}
          />
        )}
      </div>
    </div>
  );
}
