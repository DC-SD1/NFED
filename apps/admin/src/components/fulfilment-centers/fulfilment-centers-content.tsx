"use client";

import { Badge, Button } from "@cf/ui";
import { IconWorldPin } from "@tabler/icons-react";
import { Download, Plus, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryStates } from "nuqs";
import React, { useEffect, useMemo } from "react";

import ContentEmptyState from "@/components/common/content-empty-state";
import FlagComponent from "@/components/common/flag-component";
import FulfilmentCentersTable from "@/components/fulfilment-centers/fulfilment-centers-table";
import DropdownComponent from "@/components/input-components/dropdown-component";
import InputComponent from "@/components/input-components/input-component";
import AppTitleToolBar from "@/components/layout/app-title-tool-bar";
import TableLoader from "@/components/skeleton/table-loader";
import { useDebounce } from "@/hooks/use-debounce";
import usePagination from "@/hooks/use-pagingation";
import { useApiClient } from "@/lib/api";
import useFulfilmentCenterStore from "@/lib/stores/fulfilment-center-store/fufilment-center-store";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import type { FulfilmentCenter } from "@/types/fulfilment-centers.types";
import { COUNTRIES } from "@/types/fulfilment-centers.types";
import { SAMPLE_FULFILMENT_CENTERS } from "@/utils/constants/sample-data";
import { ImageAssets } from "@/utils/image-assets";

export default function FulfilmentCentersContent() {
  const { onOpen } = useModal();
  const pathname = usePathname();
  const router = useRouter();
  const api = useApiClient();
  const { exportType, setExportType } = useTableStore();
  const t = useTranslations("fulfillmentCenters");
  const reset = useFulfilmentCenterStore.use.reset();
  const [selectedFilters, setSelectedFilters] = useQueryStates({
    country: parseAsString.withDefault("all"),
    searchTerm: parseAsString.withDefault(""),
    status: parseAsString.withDefault("active"),
  });
  const debouncedSearchTerm = useDebounce(selectedFilters.searchTerm);

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

  const { data: response, isPending: _isLoadingCenters } = api.useQuery(
    "get",
    "/fulfillment-centers",
    {
      params: {
        query: {
          PageNo: pageIndex,
          PageSize: pageSize,
          ...(debouncedSearchTerm !== "" && {
            SearchTerm: debouncedSearchTerm,
          }),
          ...(selectedFilters.country !== "all" && {
            Country: selectedFilters.country,
          }),
          ...(selectedFilters.status !== "all" && {
            Status: selectedFilters.status,
          }),
        },
      },
    },
    {
      throwOnError: false,
      enabled: false,
    },
  );

  const customFulfilmentCenters =
    useFulfilmentCenterStore.use.customFulfilmentCenters();

  const isLoadingCenters = false;

  const fulfilmentCenters = useMemo(() => {
    // Combine custom (store) centers with sample centers
    const allCenters: FulfilmentCenter[] = [
      ...(customFulfilmentCenters as unknown as FulfilmentCenter[]),
      ...SAMPLE_FULFILMENT_CENTERS,
    ];

    // Client-side filtering
    return allCenters.filter((center) => {
      // Filter by Search Term (Name)
      if (
        debouncedSearchTerm &&
        !center.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ) {
        return false;
      }

      // Filter by Country
      if (
        selectedFilters.country !== "all" &&
        center.country?.toLowerCase() !== selectedFilters.country.toLowerCase()
      ) {
        return false;
      }

      // Filter by Status
      if (
        selectedFilters.status !== "all" &&
        selectedFilters.status !== "active"
      ) {
        return false;
      }

      return true;
    });
  }, [debouncedSearchTerm, selectedFilters, customFulfilmentCenters]);

  const metadata =
    response?.data?.data && response.data.data.length > 0
      ? {
          total: response.data.pageData?.totalItems ?? 0,
          page: response.data.pageData?.currentPage ?? 1,
          limit: response.data.pageData?.pageSize ?? 10,
        }
      : {
          total: fulfilmentCenters.length,
          page: 1,
          limit: 10,
        };

  const handleAddNew = () => {
    reset();
    router.push(`${pathname}/new`);
  };

  useEffect(() => {
    if (response?.data?.downloadLink && !isLoadingCenters) {
      setExportType({
        ...exportType,
        isFilteringData: isLoadingCenters,
        downloadUrl: response?.data?.downloadLink,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingCenters, response?.data?.downloadLink]);

  const isDataEmpty =
    !isLoadingCenters &&
    fulfilmentCenters.length === 0 &&
    selectedFilters.searchTerm === "" &&
    selectedFilters.country === "all";

  return (
    <div>
      <AppTitleToolBar
        title={t("pageTitle")}
        toolBar={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              size="sm"
              onClick={() => {
                onOpen("ExportList", {
                  exportName: "fulfilment-centers",
                });
              }}
              className="h-12 bg-secondary text-sm text-[#1A5514] hover:bg-secondary/90 sm:h-9"
            >
              <Download size={16} />
              {t("export")}
            </Button>
            <Button
              onClick={handleAddNew}
              size="sm"
              className="h-12 text-sm sm:h-9"
            >
              <Plus size={16} />
              {t("addCenter")}
            </Button>
          </div>
        }
      />
      <div className={"mt-8"}>
        {isLoadingCenters ? (
          <TableLoader />
        ) : isDataEmpty ? (
          <div className="flex h-[60vh] items-center justify-center">
            <ContentEmptyState
              imgSrc={ImageAssets.FACTORY}
              title={t("table.emptyState.title")}
              message={t("table.emptyState.description")}
            />
          </div>
        ) : (
          <FulfilmentCentersTable
            data={fulfilmentCenters}
            paginateData={{
              pageIndex,
              pagination,
              pageSize,
              currentPage: metadata?.page,
              totalPages: Math.ceil((metadata?.total || 0) / pageSize),
              setPagination,
            }}
            toolBar={
              <>
                <div>
                  <InputComponent
                    key={"searchTerm"}
                    type="search"
                    onChange={(e) =>
                      void setSelectedFilters({ searchTerm: e.target.value })
                    }
                    value={selectedFilters.searchTerm}
                    placeholder={t("filters.searchPlaceholder")}
                    className={"min-w-[22rem] rounded-full"}
                    left={<Search className={"size-4"} />}
                  />
                </div>
                <div>
                  {selectedFilters.country === "all" ? (
                    <DropdownComponent
                      className={"rounded-full"}
                      defaultValue={selectedFilters.country}
                      placeholder={t("filters.selectFulfillmentCenter")}
                      options={COUNTRIES}
                      contentClassName={"min-w-64"}
                      onValueChange={(value) => {
                        void setSelectedFilters({ country: value });
                      }}
                      renderLabel={(option) => (
                        <div className="flex items-center gap-4">
                          {option.value !== "all" && (
                            <FlagComponent countryCode={(option as any).code} />
                          )}
                          <p>{option.label}</p>
                        </div>
                      )}
                      renderValue={(option) => (
                        <div className="mr-1.5 flex items-center gap-4">
                          <IconWorldPin
                            className={"size-4"}
                            color={"#161D14"}
                          />
                          <p>{option?.label}</p>
                        </div>
                      )}
                    />
                  ) : (
                    <Badge className="flex h-10 items-center gap-2 bg-secondary px-3 font-normal text-secondary-foreground hover:bg-secondary/80">
                      <span className="capitalize">
                        {String(selectedFilters.country)}
                      </span>
                      <button
                        onClick={() => setSelectedFilters({ country: "all" })}
                        className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </Badge>
                  )}
                </div>
                <div>
                  <DropdownComponent
                    className={"rounded-full"}
                    defaultValue={selectedFilters.status}
                    placeholder={""}
                    options={[
                      { value: "active", label: "Active" },
                      {
                        value: "archived",
                        label: "Archived",
                      },
                    ]}
                    contentClassName={"min-w-48"}
                    onValueChange={(value) => {
                      void setSelectedFilters({ status: value });
                    }}
                  />
                </div>
              </>
            }
            isFiltering={
              debouncedSearchTerm !== "" || selectedFilters.country !== "all"
            }
          />
        )}
      </div>
    </div>
  );
}
