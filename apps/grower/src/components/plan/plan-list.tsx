/* eslint-disable max-lines-per-function */
"use client";

import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@cf/ui";
import { format, isValid, parse, parseISO } from "date-fns";
import {
  CircleChevronDown,
  EllipsisVertical,
  Eye,
  FileDownIcon,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
// Removed: parseAsStringEnum, useQueryState - no longer needed without filter tabs
// import { parseAsStringEnum, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";

import emptyPlanImg from "@/assets/images/farm-plan/bare-land.png";
import EmptyStateWrapper from "@/components/dashboard/empty-state-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useApiClient } from "@/lib/api";
import { useFarmPlans } from "@/lib/queries/farm-plans-query";
import {
  computeChipStatus,
  derivePlanStatusLine,
} from "@/lib/status/plan-status";
import { showErrorToast } from "@/lib/utils/toast";

import type { PlanRow, PlanStatus } from "./types";

function parseFlexibleDate(dateString: string | undefined): Date | null {
  if (!dateString) return null;

  const isoDate = parseISO(dateString);
  if (isValid(isoDate)) return isoDate;

  const ddmmyyyyDate = parse(dateString, "dd/MM/yyyy", new Date());
  if (isValid(ddmmyyyyDate)) return ddmmyyyyDate;

  return null;
}

function StatusLine({
  apiStatus,
  startDateISO,
}: {
  apiStatus?: string;
  startDateISO?: string;
}) {
  const t = useTranslations();
  const statusLine = derivePlanStatusLine(apiStatus, startDateISO);
  if (!statusLine) return null;
  const colorMap: Record<
    NonNullable<ReturnType<typeof derivePlanStatusLine>>["color"],
    string
  > = {
    default: "#71786c",
    info: "#0063ea",
    success: "#008744",
    warning: "#FBB33A",
    destructive: "#BA1A1A",
  };
  const text = t(statusLine.labelKey as any, statusLine.params as any);

  return (
    <div
      className="text-[12px] font-normal leading-[18px]"
      style={{ color: colorMap[statusLine.color] }}
    >
      {text}
    </div>
  );
}

/**
 * @deprecated Filter tabs (All, Saved, Draft) are no longer used
 * Kept for potential future use
 */
// type InnerTab = "All" | "Saved" | "Draft";

interface PlanListProps {
  containerClassName?: string;
  farmId?: string;
  onCreate?: () => void;
  showFilterTabsLine?: boolean;
  data?: PlanRow[];
}

const statusStyles: Record<PlanStatus, { bg: string; text: string }> = {
  Due: { bg: "bg-[#c9f0d6]", text: "text-[#00572d]" },
  "Due soon": { bg: "bg-[#fef0d8]", text: "text-[#4c3600]" },
  Upcoming: { bg: "bg-[#d5e6fd]", text: "text-[#0063ea]" },
  Overdue: { bg: "bg-[#ffdad6]", text: "text-[#ba1a1a]" },
  Draft: { bg: "bg-gray-100", text: "text-gray-600" },
  Saved: { bg: "bg-gray-100", text: "text-gray-600" },
};

function StatusChip({
  status,
  mobile = false,
}: {
  status: PlanStatus;
  mobile?: boolean;
}) {
  const s = statusStyles[status];

  if (mobile) {
    // Mobile style - matching Figma exactly
    return (
      <span
        className={`inline-flex items-center justify-center rounded-[32px] px-[15px] py-[2px] text-[12px] font-normal leading-[18px] ${s.bg} ${s.text}`}
        style={{ minWidth: "93px", height: "22px" }}
      >
        {status}
      </span>
    );
  }

  // Desktop style - original design
  return (
    <span
      className={`inline-flex items-center rounded-full px-6 py-1 text-sm ${s.bg} ${s.text}`}
    >
      {status}
    </span>
  );
}

function PlanActionButtons({
  onView,
  onStart,
  showBackground = false,
  isPending = false,
}: {
  isPending?: boolean;
  onView: () => void;
  onStart: () => void;
  showBackground?: boolean;
}) {
  const t = useTranslations("farmPlan.list");

  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          "size-6 [&_svg]:!size-6",
          showBackground && "rounded-full bg-primary-lightest",
        )}
        onClick={onView}
      >
        <Eye className={cn("", showBackground && "text-foreground")} />
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "size-6 [&_svg]:!size-6",
          showBackground && "rounded-full bg-yellow-light",
        )}
      >
        <FileDownIcon
          className={cn("", showBackground && "text-yellow-dark")}
        />
      </Button>
      <Button
        className="h-12 rounded-xl px-3 py-2"
        disabled={isPending}
        onClick={onStart}
      >
        {t("farmThePlan")}
      </Button>
    </>
  );
}

export function PlanList({
  data,
  containerClassName,
  showFilterTabsLine,
  onCreate,
  farmId,
}: PlanListProps) {
  const t = useTranslations("farmPlan.list");
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isTablet, setIsTablet] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedFarmId, setSelectedFarmId] = useState(farmId);
  const { farmPlansData, isLoading } = useFarmPlans(farmId);
  const api = useApiClient();

  // NOTE: The API response doesn't include landId, which is required for the start-farming endpoint.
  // If landId is not available, the "Start Farming" button functionality will not work.
  // Backend team should add landId to FarmPlanSummaryDto
  const updateStatus = api.useMutation(
    "put",
    "/farm-planning/lands/{LandId}/start-farming",
    {
      onSuccess: (data, variables) => {
        const landId = variables.params.path.LandId;
        console.log("FarmId: ", selectedFarmId, "LandId: ", landId);
        router.push(
          `/farm-owner/farm-grow?landId=${landId}&farmId=${selectedFarmId}`,
        );
      },
      onError: (error) => {
        if (error?.errors?.[0]?.code === "LAND_NOT_FOUND") {
          showErrorToast("Land not found");
          return;
        }
        showErrorToast(
          error?.errors?.[0]?.message ??
            "Something went wrong, whilst starting farming",
        );
        return;
      },
    },
  );

  const backendRows = useMemo(() => {
    if (data && data.length > 0) return data;
    const items = Array.isArray(farmPlansData) ? farmPlansData : [];
    const mapped: PlanRow[] = items.map((p) => {
      const startDateISO: string | undefined = p?.startDate ?? undefined;
      const chip = computeChipStatus(startDateISO) ?? "Upcoming";
      return {
        id: String(p?.id ?? ""),
        planName: p?.planName ?? "N/A",
        farmName: p?.farmName ?? "N/A",
        farmId: p?.farmId ?? "",
        dateCreated: p?.dateCreated ?? "",
        startDate: startDateISO ?? "",
        monthsToGo: p?.monthsToGo ?? "",
        harvestDate: p?.harvestDate ?? "",
        startFarmingButtonStatus: p?.startFarmingButtonStatus ?? "",
        status: chip,
        isSaved: false,
        isDraft: false,
        landId: p.landId, // NOTE: Not in current API response
        // landId: p?.landId ?? "", // NOTE: Not in current API response
      } as PlanRow;
    });
    return mapped;
  }, [data, farmPlansData]);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsTablet(w >= 768 && w < 1280);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /**
   * Filter tabs disabled - showing all plans by default
   * @deprecated Removed filter functionality for All/Saved/Draft
   */
  // const [innerTab, setInnerTab] = useQueryState(
  //   "planTab",
  //   parseAsStringEnum<InnerTab>(["All", "Saved", "Draft"]).withDefault("All"),
  // );

  // Note: Previously filtered by innerTab (All/Saved/Draft)
  // Now returns all plans without filtering
  const filtered = useMemo(() => {
    return backendRows;
    // Previous filter logic (disabled):
    // if (innerTab === "Saved") return source.filter((d) => d.isSaved);
    // if (innerTab === "Draft") return source.filter((d) => d.isDraft);
    // return source;
  }, [backendRows]);

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStart = (landId: string | undefined, farmId: string) => {
    if (!landId || landId === "" || landId === undefined) {
      showErrorToast("Land ID not available. Please contact support.");
      return;
    }

    if (!farmId || farmId === "" || farmId === undefined) {
      showErrorToast("Farm ID not available. Please contact support.");
      return;
    }

    setSelectedFarmId(farmId);

    updateStatus.mutate({
      params: {
        path: {
          LandId: landId,
        },
      },
    });
  };
  const handleView = (id: string) => {
    router.push(`/farm-owner/farm-plan/summary?farmPlanId=${id}`);
  };

  const TableView = (
    <div className="rounded-md">
      <Table className="table-fixed border-separate border-spacing-y-1">
        <TableHeader className="bg-transparent [&_tr]:border-0">
          <TableRow className="bg-transparent hover:bg-transparent">
            <TableHead
              className={cn(
                "px-4 font-bold text-foreground",
                isTablet ? "w-[18%]" : "w-[14%]",
              )}
            >
              {t("headers.planName")}
            </TableHead>
            <TableHead
              className={cn(
                "px-4 font-bold text-foreground",
                isTablet ? "w-[18%]" : "w-[14%]",
              )}
            >
              {t("headers.farmName")}
            </TableHead>
            <TableHead
              className={cn(
                "px-4 font-bold text-foreground",
                isTablet ? "w-[11%]" : "w-[10%]",
              )}
            >
              {t("headers.dateCreated")}
            </TableHead>
            <TableHead
              className={cn(
                "px-4 font-bold text-foreground",
                isTablet ? "w-[14%]" : "w-[13%]",
              )}
            >
              {t("headers.startDate")}
            </TableHead>
            <TableHead
              className={cn(
                "px-4 font-bold text-foreground",
                isTablet ? "w-[11%]" : "w-[10%]",
              )}
            >
              {t("headers.harvestDate")}
            </TableHead>
            <TableHead
              className={cn(
                "px-4 font-bold text-foreground",
                isTablet ? "w-[15%]" : "w-[14%]",
              )}
            >
              {t("headers.status")}
            </TableHead>
            <TableHead
              className={cn(
                "px-4 text-right font-bold text-foreground",
                isTablet ? "w-[13%]" : "w-1/4",
              )}
            >
              {t("headers.action")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((row) => {
            const parsedStartDate = parseFlexibleDate(row.startDate);
            const formattedStartDate = parsedStartDate
              ? format(parsedStartDate, "dd/MM/yyyy")
              : "";

            const parsedDateCreated = parseFlexibleDate(row.dateCreated);
            const formattedDateCreated = parsedDateCreated
              ? format(parsedDateCreated, "dd/MM/yyyy")
              : "";

            const parsedHarvestDate = parseFlexibleDate(row.harvestDate);
            const formattedHarvestDate = parsedHarvestDate
              ? format(parsedHarvestDate, "dd/MM/yyyy")
              : "";

            return (
              <TableRow
                key={row.id}
                className="border-none bg-background hover:bg-background"
              >
                <td
                  className={cn(
                    "rounded-l-2xl px-4 py-3 text-[14px] leading-[20px] text-foreground",
                    isTablet ? "w-[18%]" : "w-[14%]",
                  )}
                >
                  {row.planName}
                </td>
                <td
                  className={cn("px-4 py-3", isTablet ? "w-[18%]" : "w-[14%]")}
                >
                  <div className="text-[12px] leading-[16px] text-foreground">
                    {row.farmName}
                  </div>
                  <div className="text-[12px] leading-[16px] text-[#71786c]">
                    Farm ID: {row.farmId}
                  </div>
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-[14px] leading-[20px] text-foreground",
                    isTablet ? "w-[11%]" : "w-[10%]",
                  )}
                >
                  {formattedDateCreated}
                </td>
                <td
                  className={cn("px-4 py-3", isTablet ? "w-[14%]" : "w-[13%]")}
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] leading-[20px] text-foreground">
                      {formattedStartDate}
                    </span>
                    <StatusLine
                      apiStatus={undefined}
                      startDateISO={row.startDate}
                    />
                  </div>
                </td>
                <td
                  className={cn(
                    "px-2 py-3 text-[14px] leading-[20px] text-foreground",
                    isTablet ? "w-[11%]" : "w-[10%]",
                  )}
                >
                  {formattedHarvestDate}
                </td>
                <td
                  className={cn("px-2 py-3", isTablet ? "w-[15%]" : "w-[14%]")}
                >
                  <StatusChip status={row.status} />
                </td>
                <td
                  className={cn(
                    "rounded-r-2xl px-2 py-3",
                    isTablet ? "w-[13%]" : "w-1/4",
                  )}
                >
                  <div className="flex items-center justify-end gap-1">
                    {isTablet ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className="ml-auto size-12 [&_svg]:!size-6"
                          >
                            <EllipsisVertical />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="w-auto border-none bg-transparent p-0 shadow-none"
                        >
                          <div className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-md">
                            <PlanActionButtons
                              isPending={updateStatus.isPending}
                              onView={() => handleView(row.id)}
                              onStart={() =>
                                handleStart(row.landId, row.farmId)
                              }
                              showBackground
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <PlanActionButtons
                        isPending={updateStatus.isPending}
                        onView={() => handleView(row.id)}
                        onStart={() => handleStart(row.landId, row.farmId)}
                      />
                    )}
                  </div>
                </td>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  const MobileCards = (
    <div className="space-y-3">
      {filtered.map((row) => {
        const isExpanded = expandedCards[row.id] || false;

        const parsedHarvestDate = parseFlexibleDate(row.harvestDate);
        const formattedHarvestDate = parsedHarvestDate
          ? format(parsedHarvestDate, "dd/MM/yyyy")
          : "";

        const parsedDateCreated = parseFlexibleDate(row.dateCreated);
        const formattedDateCreated = parsedDateCreated
          ? format(parsedDateCreated, "dd/MM/yyyy")
          : "";

        return (
          <div
            key={row.id}
            className={cn(
              "w-full rounded-[16px] bg-white p-4 shadow-[0px_2px_12px_rgba(22,29,20,0.1)]",
              isExpanded ? "pb-4" : "pb-4",
            )}
          >
            {/* Card Header - Always Visible */}
            <button
              type="button"
              onClick={() => toggleCard(row.id)}
              className="flex w-full items-center gap-3"
            >
              <div className="flex flex-1 flex-col justify-center">
                <div className="text-left text-[16px] font-semibold leading-[24px] text-foreground">
                  {row.planName}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="text-[12px] font-semibold uppercase leading-[18px] text-foreground">
                  {isExpanded ? t("mobile.harvestTime") : formattedHarvestDate}
                </div>
                <StatusLine
                  apiStatus={undefined}
                  startDateISO={row.startDate}
                />
              </div>
              <div className="ml-2">
                <CircleChevronDown
                  className={cn(
                    "size-5 text-primary transition-transform",
                    isExpanded ? "-rotate-180" : "rotate-0",
                  )}
                />
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4">
                {/* Farm Info */}
                <div className="flex items-start justify-between">
                  <div className="text-[12px] font-semibold leading-[18px] text-foreground">
                    {row.farmName}
                  </div>
                  <div className="max-w-[60%] truncate text-[12px] leading-[18px] text-[#71786c]">
                    Farm ID: {row.farmId}
                  </div>
                </div>

                {/* Date Created */}
                <div className="flex items-start justify-between">
                  <div className="text-[12px] font-semibold leading-[18px] text-foreground">
                    {t("headers.dateCreated")}
                  </div>
                  <div className="text-[12px] leading-[18px] text-[#71786c]">
                    {formattedDateCreated}
                  </div>
                </div>

                {/* Harvest Date */}
                <div className="flex items-start justify-between">
                  <div className="text-[12px] font-semibold leading-[18px] text-foreground">
                    {t("headers.harvestDate")}
                  </div>
                  <div className="text-[12px] leading-[18px] text-[#71786c]">
                    {formattedHarvestDate}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start justify-between">
                  <div className="text-[12px] font-semibold leading-[18px] text-foreground">
                    {t("mobile.status")}
                  </div>
                  <StatusChip status={row.status} mobile />
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    className="size-[52px] rounded-full bg-primary-lightest [&_svg]:!size-5"
                    onClick={() => handleView(row.id)}
                  >
                    <Eye className="text-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="size-[52px] rounded-full bg-[#fef0d8] [&_svg]:!size-5"
                  >
                    <FileDownIcon className="text-[#805a00]" />
                  </Button>
                  <Button
                    className="h-[48px] flex-1 rounded-xl px-3 py-2 text-[14px] font-bold"
                    disabled={updateStatus.isPending}
                    onClick={() => handleStart(row.landId, row.farmId)}
                  >
                    {updateStatus.isPending ? t("starting") : t("farmThePlan")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <EmptyStateWrapper
      title={t("title")}
      addButtonText=""
      statCards={[]}
      filterTabs={[]} // Disabled: was ["All", "Saved", "Draft"]
      activeFilter={undefined} // Disabled: was innerTab
      onFilterChange={undefined} // Disabled: was (v) => setInnerTab(v as InnerTab)
      showAddButton={false}
      showExportButton={false}
      showStatsCards={false}
      showFilterTabsLine={showFilterTabsLine}
      containerClassName={cn(
        "rounded-none bg-transparent p-1 shadow-none",
        containerClassName,
      )}
      contentClassName="bg-transparent rounded-none shadow-none p-1"
      filterTabsClassName="bg-transparent p-2"
    >
      {isLoading ? (
        isMobile && !isTablet ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-full rounded-[16px] bg-background p-4 shadow-[0px_2px_12px_rgba(22,29,20,0.1)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-1 flex-col gap-1">
                    <Skeleton className="h-6 w-3/4 rounded" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-[18px] w-24 rounded" />
                    <Skeleton className="h-[18px] w-20 rounded" />
                  </div>
                  <Skeleton className="size-5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md">
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex w-full items-center gap-1 rounded-2xl bg-background px-4 py-3"
                >
                  <div className="w-[14%]">
                    <Skeleton className="h-5 w-4/5 rounded" />
                  </div>
                  <div className="w-[14%]">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-3 w-2/3 rounded" />
                    </div>
                  </div>
                  <div className="w-[10%]">
                    <Skeleton className="h-5 w-4/5 rounded" />
                  </div>
                  <div className="w-[13%]">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-5 w-4/5 rounded" />
                      <Skeleton className="h-[18px] w-3/4 rounded" />
                    </div>
                  </div>
                  <div className="w-[10%]">
                    <Skeleton className="h-5 w-4/5 rounded" />
                  </div>
                  <div className="w-[14%]">
                    <Skeleton className="h-[30px] w-20 rounded-full" />
                  </div>
                  <div className="w-1/4">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="size-12 rounded-full" />
                      <Skeleton className="size-12 rounded-full" />
                      <Skeleton className="h-12 w-28 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : filtered.length > 0 ? (
        isMobile && !isTablet ? (
          MobileCards
        ) : (
          TableView
        )
      ) : (
        // Removed FilteredEmptyState check (was: backendRows.length > 0 && innerTab !== "All")
        // Now always shows EmptyStateContent when no plans
        <EmptyStateContent
          onCreate={() => {
            void onCreate?.();
          }}
        />
      )}
    </EmptyStateWrapper>
  );
}

/**
 * @deprecated FilteredEmptyState is no longer used since filter tabs were removed
 * Kept for reference in case filters are re-enabled in the future
 */
// function FilteredEmptyState({
//   filter,
//   onClear,
// }: {
//   filter: InnerTab;
//   onClear: () => void;
// }) {
//   const label = filter.toLowerCase();
//   return (
//     <div className="flex flex-col items-center gap-6 rounded-[24px] px-8 py-12">
//       <div className="size-[100px] overflow-hidden rounded-[8px] bg-[#e8ebe1]">
//         <Image
//           src={emptyPlanImg}
//           alt="Open field"
//           className="size-full object-cover"
//         />
//       </div>
//       <div className="flex w-full max-w-[402px] flex-col items-center gap-2 text-center text-[#161d14]">
//         <div className="text-[24px] font-bold leading-[32px]">
//           No {label} plans
//         </div>
//         <div className="text-[14px] leading-[20px]">
//           Try changing or clearing your filters to see more plans.
//         </div>
//       </div>
//       <button
//         type="button"
//         onClick={onClear}
//         className="bg-primary hover:bg-primary/90 flex w-full max-w-[402px] items-center justify-center gap-2 rounded-[12px] p-4 text-[16px] font-bold text-white"
//       >
//         View all plans
//       </button>
//     </div>
//   );
// }

function EmptyStateContent({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations("farmPlan.list");

  return (
    <div className="flex flex-col items-center gap-6 rounded-[24px] px-8 py-2">
      <div className="size-[100px] overflow-hidden rounded-[8px] bg-[#e8ebe1]">
        <Image
          src={emptyPlanImg}
          alt="Open field"
          className="size-full object-cover"
        />
      </div>
      <div className="flex w-full max-w-[402px] flex-col items-center gap-2 text-center text-[#161d14]">
        <div className="text-[24px] font-bold leading-[32px]">
          {t("empty.title")}
        </div>
        <div className="text-[14px] leading-[20px]">
          {t("empty.description")}
        </div>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="flex w-full max-w-[402px] items-center justify-center gap-2 rounded-[12px] bg-primary p-4 text-[16px] font-bold text-white hover:bg-primary/90"
      >
        {t("empty.createButton")}
        <Plus className="size-4" />
      </button>
    </div>
  );
}
