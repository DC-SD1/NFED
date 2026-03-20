"use client";

import type { paths } from "@cf/api";
import { Button } from "@cf/ui";
import { React } from "@cf/ui/icons";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";

import PrimaryButton from "@/components/buttons/primary-button";
import ContentEmptyState from "@/components/common/content-empty-state";
import DateRangePicker from "@/components/input-components/date-range-picker";
import DropdownComponent from "@/components/input-components/dropdown-component";
import AppSheetModal from "@/components/sheets/app-sheet-modal";
import ActivityHistoryLoader from "@/components/skeleton/activity-history-loader";
import ActivityHistoryList from "@/components/user-management/activity-history-list";
import usePagination from "@/hooks/use-pagingation";
import { useApiClient } from "@/lib/api";
import useActivityHistoryStore from "@/lib/stores/activity-history-store/activity-history-store";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import { logger } from "@/lib/utils/logger";
import type { AuditLogsResponse } from "@/types/user-management.types";
import { ACTIVITY_TYPES } from "@/utils/constants/common";
import { ImageAssets } from "@/utils/image-assets";

type RequestParam = paths["/admin/activities"]["get"]["parameters"]["query"];
type ActionType = NonNullable<NonNullable<RequestParam>>["ActivityType"];

interface FilterProps {
  pageNo?: number;
  actionType?: ActionType;
  from?: Date | null;
  to?: Date | null;
}

export default function ActivityHistorySheetModal() {
  const { isOpen, onClose, type } = useModal();
  const { pager, appendAuditLogs, auditLogs, reset } =
    useActivityHistoryStore();
  const t = useTranslations("userManagement.activityHistory");
  const isModalOpen = isOpen && type === "ActivityHistory";
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const api = useApiClient();
  const auth = useAuthUser();
  const previousScrollTopRef = useRef<any>();
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    actionType: string;
    from?: Date;
    to?: Date;
  }>({
    actionType: "all",
    from: undefined,
    to: undefined,
  });

  const [{ pageIndex }, setPagination] = usePagination({
    pageIndex: 1,
    pageSize: 10,
  });

  const handleFetchLogs = async (params?: FilterProps) => {
    if (!auth?.userId) return;
    try {
      setIsLoading(true);
      const { pageNo = 1, actionType = "all", from, to } = params ?? {};
      if (!isModalOpen) return;

      const response = await api.client.GET("/admin/activities", {
        params: {
          query: {
            UserId: auth.userId,
            PageNo: pageNo,
            ...(actionType !== "all" && { ActivityType: actionType }),
            ...(from && { StartDate: format(from, "yyyy-MM-dd") }),
            ...(to && { EndDate: format(to, "yyyy-MM-dd") }),
          },
        },
      });
      const logResponse = response.data as any as AuditLogsResponse;
      if (logResponse?.data?.data) {
        const pager = logResponse.data.pageData;
        appendAuditLogs(logResponse.data.data, {
          currentPage: pager?.pageNo ?? 1,
          totalPages: pager?.totalPages ?? 0,
        });
      }
    } catch (e) {
      logger.error("Failed to fetch activity history logs", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

    if (previousScrollTopRef.current !== undefined) {
      const isScrollingDown = scrollTop > previousScrollTopRef.current;

      // If scrolling down AND near the bottom (within 10px)
      if (
        isScrollingDown &&
        scrollHeight - scrollTop - clientHeight < 10 &&
        scrollTop > 48
      ) {
        setHasNextPage(true);
      }
    }

    // Update previous scroll position
    previousScrollTopRef.current = scrollTop;
  }, []);

  const handleFetchMore = () => {
    if (pageIndex >= pager.totalPages) return;
    setPagination((prev) => ({
      ...prev,
      pageIndex: pageIndex + 1,
    }));
    void handleFetchLogs({ pageNo: pageIndex + 1 });
  };

  const handleFilterType = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      actionType: value,
    }));
    reset();
    void handleFetchLogs({
      actionType: value as ActionType,
      pageNo: 1,
    });
  };

  const handleFilterDate = (range: DateRange) => {
    setFilters((prev) => ({
      ...prev,
      from: range.from,
      to: range.to,
    }));
    reset();
    void handleFetchLogs({
      ...filters,
      actionType: filters.actionType as ActionType,
      from: range.from,
      to: range.to,
      pageNo: 1,
    });
  };

  const handleResetFilters = () => {
    setFilters({ actionType: "all", from: undefined, to: undefined });
    reset();
    void handleFetchLogs();
  };

  const onClearDates = () => {
    setFilters((prev) => ({
      ...prev,
      from: undefined,
      to: undefined,
    }));
    reset();
    void handleFetchLogs();
  };

  useEffect(() => {
    void handleFetchLogs({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasFilters =
    filters.actionType !== "all" ||
    (filters.from !== undefined && filters.to !== undefined);

  return (
    <AppSheetModal
      key={"activity-history-sheet"}
      title={t("title")}
      open={isModalOpen}
      onClose={onClose}
      bodyClassName="pt-8 pb-0"
    >
      <div className="flex flex-col gap-16">
        {isLoading && auditLogs.length === 0 ? (
          <ActivityHistoryLoader />
        ) : (
          <>
            {auditLogs.length === 0 && !hasFilters ? (
              <div
                className={
                  "flex h-72 flex-col items-center justify-center sm:h-[60vh]"
                }
              >
                <ContentEmptyState
                  imgSrc={ImageAssets.PROGRESS_LIST}
                  title={t("emptyState.title")}
                  message={t("emptyState.description")}
                />
              </div>
            ) : (
              <div className={"flex flex-col gap-4"}>
                <div className={"flex items-center gap-2"}>
                  <DateRangePicker
                    from={filters.from}
                    to={filters.to}
                    className={"rounded-full"}
                    placeholder={"Pick a date"}
                    onDateChange={(range) => {
                      handleFilterDate(range);
                    }}
                    onClear={onClearDates}
                  />
                  <DropdownComponent
                    className={"rounded-full"}
                    value={filters.actionType}
                    onValueChange={(value) => {
                      handleFilterType(value);
                    }}
                    placeholder={t("actionTypePlaceholder")}
                    options={ACTIVITY_TYPES}
                  />
                </div>
                <div className={"flex justify-end"}>
                  <Button
                    onClick={handleResetFilters}
                    variant={"secondary"}
                    size={"sm"}
                  >
                    <RefreshCw className={"size-4"} />
                    Reset
                  </Button>
                </div>

                {auditLogs.length === 0 && hasFilters ? (
                  <div
                    className={"flex h-64 flex-col items-center justify-center"}
                  >
                    <ContentEmptyState
                      imgSrc={ImageAssets.PROGRESS_LIST}
                      title={t("emptyState.notFound")}
                      message={t("emptyState.notFoundDescription")}
                      hasImage={false}
                    />
                  </div>
                ) : (
                  <div
                    className="h-[78vh] overflow-y-auto pb-8"
                    onScroll={handleScroll}
                  >
                    <ActivityHistoryList logs={auditLogs} />
                    {pageIndex < pager.totalPages && hasNextPage && (
                      <div className={"mt-4 flex justify-center"}>
                        <PrimaryButton
                          isLoading={pager.totalPages > 1 && isLoading}
                          onClick={handleFetchMore}
                          size={"sm"}
                          buttonContent={isLoading ? "" : "More"}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppSheetModal>
  );
}
