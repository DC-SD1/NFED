"use client";

import type { components } from "@cf/api";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  cn,
  Drawer,
  DrawerClose,
  DrawerContent,
  Sheet,
  SheetClose,
  SheetContent,
} from "@cf/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight, Loader2, MoreHorizontal, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import calendar from "@/assets/images/calendar.svg";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useApiClient } from "@/lib/api/client";
import { formatBadgeCount } from "@/lib/notifications/display-utils";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";

const TASK_FILTERS = ["all", "pending", "upcoming", "completed"] as const;
type TaskFilter = (typeof TASK_FILTERS)[number];

type TaskStatus = "pending" | "upcoming" | "not_started" | "completed";

type ApiTaskStatus = components["schemas"]["ActivityStatusEnum"];
type ApiTask = components["schemas"]["ActivityScheduleItem"];
type UiTask = ApiTask & { uiStatus: TaskStatus };

const API_STATUS_BY_FILTER: Record<TaskFilter, ApiTaskStatus | undefined> = {
  all: undefined,
  pending: "Pending",
  upcoming: "Upcoming",
  completed: "Completed",
};

interface RecentActivityQueryParams {
  FarmerId: string;
  PageSize?: number | null;
  PageNo?: number | null;
  SortBy?: string | null;
  SortDescending?: boolean | null;
  Status?: ApiTaskStatus | null;
}

// Map API status enum to UI status
const mapApiStatusToUiStatus = (
  statusValue: ApiTaskStatus | number | undefined,
): TaskStatus => {
  if (typeof statusValue === "number") {
    switch (statusValue) {
      case 1:
        return "pending";
      case 2:
        return "upcoming";
      case 3:
        return "completed";
      default:
        return "not_started";
    }
  }

  switch (statusValue) {
    case "Pending":
      return "pending";
    case "Upcoming":
      return "upcoming";
    case "Completed":
      return "completed";
    default:
      return "not_started";
  }
};

interface TaskCardItemProps {
  task: UiTask;
  formatter: Intl.DateTimeFormat;
  statusConfig: Record<TaskStatus, { label: string; className: string }>;
  isUpdating: boolean;
  onMarkComplete: (task: UiTask) => void;
  dueLabel: string;
  markDoneLabel: string;
}

function TaskCardItem({
  task,
  formatter,
  statusConfig,
  isUpdating,
  onMarkComplete,
  dueLabel,
  markDoneLabel,
}: TaskCardItemProps) {
  const status = statusConfig[task.uiStatus];
  const dueDate = task.endDate
    ? formatter.format(new Date(task.endDate))
    : "N/A";

  return (
    <div className="rounded-[8px] bg-white px-5 py-5 shadow-[0_2px_64px_0_rgba(22,29,20,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <p className="text-[14px] font-semibold text-[hsl(var(--foreground))] md:text-lg">
            {task.majorActivity || task.activityCode || "N/A"}
          </p>
          <p className="text-sm text-[rgba(38,56,47,0.62)]">
            {task.phase || ""}
          </p>
          <div className="flex flex-wrap items-center gap-1 text-sm">
            <span className="text-foreground">{dueLabel}: </span>
            <span className="text-sm text-[hsl(var(--foreground))]">
              {dueDate}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <span
            className={cn(
              "rounded-full px-2 py-1.5 text-sm font-medium",
              status.className,
            )}
          >
            {status.label}
          </span>
          {task.uiStatus === "pending" && (
            <Button
              type="button"
              size="sm"
              disabled={isUpdating}
              onClick={() => onMarkComplete(task)}
              className="h-10 rounded-xl px-5 text-[15px] font-semibold text-[hsl(var(--primary-foreground))]"
            >
              {isUpdating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                markDoneLabel
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface TaskListSkeletonProps {
  count?: number;
  className?: string;
}

function TaskListSkeleton({ count = 3, className }: TaskListSkeletonProps) {
  return (
    <div className={cn("animate-pulse space-y-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`task-skeleton-${index}`}
          className="h-24 rounded-[8px] bg-gray-200"
        />
      ))}
    </div>
  );
}

interface TaskEmptyStateContentProps {
  title: string;
  subtitle: string;
  hint?: string;
}

function TaskEmptyStateContent({
  title,
  subtitle,
  hint,
}: TaskEmptyStateContentProps) {
  return (
    <>
      <div className="relative mb-8">
        <Image src={calendar} alt="Stacked Calendar Icons" />
      </div>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <p className="text-lg text-muted-foreground">{subtitle}</p>
      {hint && <p className="mt-3 text-sm text-muted-foreground/80">{hint}</p>}
    </>
  );
}

interface TaskVirtualizedListProps {
  tasks: UiTask[];
  formatter: Intl.DateTimeFormat;
  statusConfig: Record<TaskStatus, { label: string; className: string }>;
  isUpdating: boolean;
  onMarkComplete: (task: UiTask) => void;
  dueLabel: string;
  markDoneLabel: string;
  className?: string;
}

function TaskVirtualizedList({
  tasks,
  formatter,
  statusConfig,
  isUpdating,
  onMarkComplete,
  dueLabel,
  markDoneLabel,
  className,
}: TaskVirtualizedListProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 172,
    measureElement:
      typeof window !== "undefined" && navigator.userAgent !== "jsdom"
        ? (element) => element?.getBoundingClientRect().height ?? 172
        : undefined,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className={cn("h-full overflow-y-auto", className)}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: "relative",
          width: "100%",
        }}
      >
        {virtualItems.map((virtualItem) => {
          const task = tasks[virtualItem.index];
          if (!task) {
            return null;
          }

          return (
            <div
              key={task.id}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 right-0 pb-4"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <TaskCardItem
                task={task}
                formatter={formatter}
                statusConfig={statusConfig}
                isUpdating={isUpdating}
                onMarkComplete={onMarkComplete}
                dueLabel={dueLabel}
                markDoneLabel={markDoneLabel}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to get context-aware empty state content
const getEmptyStateContent = (
  filter: TaskFilter,
  totalTasks: number,
  t: ReturnType<typeof useTranslations<"dashboard.tasks">>,
): { title: string; subtitle: string; hint: string } => {
  // If truly no tasks at all, show generic message
  if (totalTasks === 0) {
    return {
      title: t("noTasksTitle"),
      subtitle: t("noTasksSubtitle"),
      hint: "",
    };
  }

  // Otherwise show filter-specific message with hint
  const baseKey = `emptyStates.${filter}` as const;
  return {
    title: t(`${baseKey}.title`),
    subtitle: t(`${baseKey}.subtitle`),
    hint: t(`${baseKey}.hint`),
  };
};

/* eslint-disable max-lines-per-function */
export default function TasksDashboard() {
  const t = useTranslations("dashboard.tasks");
  const locale = useLocale();
  const api = useApiClient();
  const { userId } = useAuthUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useQueryState<TaskFilter>(
    "taskFilter",
    parseAsStringEnum<TaskFilter>([...TASK_FILTERS]).withDefault("all"),
  );
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const statusParam = API_STATUS_BY_FILTER[activeTab];

  const queryParams = useMemo<RecentActivityQueryParams | null>(() => {
    if (!userId) {
      return null;
    }

    const baseParams: RecentActivityQueryParams = {
      FarmerId: userId,
      PageSize: 50,
      PageNo: 1,
    };

    // Add sorting based on status
    if (activeTab === "completed") {
      return {
        ...baseParams,
        Status: API_STATUS_BY_FILTER[activeTab],
        SortBy: "completedAt",
        SortDescending: true, // Most recently completed first
      };
    } else if (statusParam) {
      return {
        ...baseParams,
        Status: statusParam,
        SortBy: "endDate",
        SortDescending: false, // Oldest deadline first (most urgent at top)
      };
    }

    return {
      ...baseParams,
      SortBy: "endDate",
      SortDescending: false, // Default: oldest deadline first
    };
  }, [statusParam, userId, activeTab]);

  const requestQuery = useMemo<RecentActivityQueryParams>(() => {
    if (queryParams) {
      return queryParams;
    }

    return {
      FarmerId: "",
      PageSize: 50,
      PageNo: 1,
      SortBy: null,
      SortDescending: null,
      Status: null,
    };
  }, [queryParams]);

  const isQueryEnabled = Boolean(queryParams);

  const {
    data: tasksData,
    error,
    isLoading,
    isFetching,
  } = api.useQuery("get", "/activity-schedule/recent", {
    params: { query: requestQuery },
    enabled: isQueryEnabled,
  });

  // Mutation for marking tasks as completed
  const { mutate: updateTaskStatus, isPending: isUpdating } = api.useMutation(
    "post",
    "/activity-schedule/update/{Id}",
    {
      onSuccess: async () => {
        // Invalidate and refetch tasks query
        await queryClient.invalidateQueries({
          queryKey: ["get", "/activity-schedule/recent"],
        });
      },
      onError: (error) => {
        console.error("Failed to update task status:", error);
      },
    },
  );
  const handleMarkComplete = useCallback(
    (task: UiTask) => {
      if (!task.id) {
        return;
      }

      updateTaskStatus({
        params: { path: { Id: task.id } },
        body: { status: "Completed" },
      });
    },
    [updateTaskStatus],
  );

  const tabs = useMemo<readonly { value: TaskFilter; label: string }[]>(
    () => [
      { value: "all" as const, label: t("tabAll") },
      { value: "pending" as const, label: t("tabPending") },
      { value: "upcoming" as const, label: t("tabUpcoming") },
      { value: "completed" as const, label: t("tabDone") },
    ],
    [t],
  );

  // Transform API data to include UI status
  const tasks = useMemo<UiTask[]>(() => {
    if (!Array.isArray(tasksData) || tasksData.length === 0) {
      return [];
    }

    return tasksData.map((task) => ({
      ...task,
      uiStatus: mapApiStatusToUiStatus(
        task.status?.value as 1 | 2 | 3 | undefined,
      ),
    }));
  }, [tasksData]);

  const filteredTasks = useMemo(() => {
    if (activeTab === "all") return tasks;
    return tasks.filter((task) => task.uiStatus === activeTab);
  }, [activeTab, tasks]);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    [locale],
  );

  const statusConfig: Record<
    TaskStatus,
    {
      label: string;
      className: string;
    }
  > = useMemo(
    () => ({
      pending: {
        label: t("statuses.pending"),
        className: "bg-[hsl(var(--red-light))] text-[hsl(var(--red-dark))]",
      },
      upcoming: {
        label: t("statuses.upcoming"),
        className: "bg-[hsl(var(--blue-light))] text-[hsl(var(--blue-semi))]",
      },
      not_started: {
        label: t("statuses.notStarted"),
        className:
          "border border-[hsl(var(--gray-semi-dark))] bg-[hsl(var(--gray-light))] text-[hsl(var(--gray-dark))]",
      },
      completed: {
        label: t("statuses.completed"),
        className:
          "bg-[hsl(var(--primary-light))] text-[hsl(var(--primary-dark))]",
      },
    }),
    [t],
  );
  const dueLabel = t("due");
  const markDoneLabel = t("markDone");
  const closeLabel = t("close");

  const tabRefs = useRef<Record<TaskFilter, HTMLButtonElement | null>>({
    all: null,
    pending: null,
    upcoming: null,
    completed: null,
  });
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updateUnderline = () => {
      const el = tabRefs.current[activeTab];
      if (el) {
        setUnderlineStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
        });
      }
    };

    requestAnimationFrame(updateUnderline);
  }, [activeTab, tabs, filteredTasks.length]);

  useEffect(() => {
    const handleResize = () => {
      const el = tabRefs.current[activeTab];
      if (el) {
        setUnderlineStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab]);

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full rounded-[24px] border-none shadow-[0_16px_40px_rgba(36,108,70,0.14)]">
        <CardHeader className="flex flex-col gap-2 rounded-t-[24px] px-3 pt-6 md:gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base leading-tight md:text-xl">
                {t("title")}
              </h2>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <TaskListSkeleton />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    console.error("Failed to fetch tasks:", error);
  }

  const drawerList =
    isFetching && filteredTasks.length === 0 ? (
      <div className="flex h-full flex-col px-6 pb-6 pt-6">
        <TaskListSkeleton count={4} />
      </div>
    ) : filteredTasks.length === 0 ? (
      <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
        <TaskEmptyStateContent
          {...getEmptyStateContent(activeTab, tasks.length, t)}
        />
      </div>
    ) : (
      <TaskVirtualizedList
        tasks={filteredTasks}
        formatter={formatter}
        statusConfig={statusConfig}
        isUpdating={isUpdating}
        onMarkComplete={handleMarkComplete}
        dueLabel={dueLabel}
        markDoneLabel={markDoneLabel}
        className="flex-1 px-6 pb-6"
      />
    );
  const displayedTasks = filteredTasks.slice(0, 4);

  return (
    <>
      <Card className="w-full rounded-[24px] border-none shadow-[0_16px_40px_rgba(36,108,70,0.14)]">
        <CardHeader className="flex flex-col gap-2 rounded-t-[24px] p-0 px-3 pt-6 md:gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base leading-tight md:text-xl">
                {t("title")}
              </h2>
              <Badge className="rounded-full bg-[hsl(var(--red-light))] px-1.5 py-0.5 text-sm font-medium text-[hsl(var(--red-dark))] hover:bg-[hsl(var(--red-light))]">
                {formatBadgeCount(tasks.length)}
              </Badge>
            </div>
            <MoreHorizontal className="size-6" />
          </div>
        </CardHeader>

        {tasks.length === 0 ? (
          <Card className="border-none bg-transparent">
            <CardContent className="flex flex-col items-center justify-center px-3 pb-8">
              <TaskEmptyStateContent
                {...getEmptyStateContent(activeTab, tasks.length, t)}
              />
            </CardContent>
          </Card>
        ) : (
          <CardContent className="space-y-2 px-3 pb-3">
            <div className="w-full overflow-x-auto">
              <div
                role="tablist"
                aria-label={t("title")}
                className="relative flex min-w-0 gap-1"
              >
                {tabs.map(({ value, label }) => (
                  <Button
                    ref={(el) => {
                      tabRefs.current[value] = el;
                    }}
                    key={value}
                    type="button"
                    variant="unstyled"
                    role="tab"
                    aria-selected={activeTab === value}
                    onClick={() => setActiveTab(value)}
                    className={cn(
                      "relative shrink-0 whitespace-nowrap pb-3 text-base font-medium transition-colors duration-200",
                      activeTab === value
                        ? "text-[hsl(var(--primary-dark))]"
                        : "text-muted-foreground hover:text-[hsl(var(--primary-dark))]",
                    )}
                  >
                    {label}
                  </Button>
                ))}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/10" />
                <div
                  className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
                  style={{
                    left: underlineStyle.left,
                    width: underlineStyle.width,
                  }}
                />
              </div>
            </div>
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <TaskEmptyStateContent
                  {...getEmptyStateContent(activeTab, tasks.length, t)}
                />
              </div>
            ) : (
              <>
                {displayedTasks.map((task, index) => (
                  <TaskCardItem
                    key={task.id ?? `${task.activityCode ?? "task"}-${index}`}
                    task={task}
                    formatter={formatter}
                    statusConfig={statusConfig}
                    isUpdating={isUpdating}
                    onMarkComplete={handleMarkComplete}
                    dueLabel={dueLabel}
                    markDoneLabel={markDoneLabel}
                  />
                ))}
                {/* <div className="flex justify-end px-1 pb-1 md:justify-end">
                  <Button
                    type="button"
                    variant="unstyled"
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex flex-row items-center gap-1 text-[15px] font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))]"
                  >
                    {t("viewMore")}
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                </div> */}
              </>
            )}
          </CardContent>
        )}
        <CardFooter className="flex justify-end px-3 py-1">
          <Button
            variant="unstyled"
            className="px-0 text-sm font-bold text-primary"
            onClick={() => {
              void setIsDrawerOpen(true);
            }}
          >
            {t("viewMore")}
            <ChevronRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>

      {isMobile ? (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="mt-0 flex h-[85vh] max-h-[85vh] flex-col overflow-hidden rounded-t-[24px] border-none bg-background p-0">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                {t("modalTitle")}
              </h3>
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={closeLabel}
                  className="size-9 rounded-full text-[rgba(29,41,32,0.6)] hover:bg-black/5"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </DrawerClose>
            </div>
            <div className="flex-1 overflow-hidden">{drawerList}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetContent
            side="right"
            hideCloseButton
            className="flex h-full max-w-[420px] flex-col overflow-hidden p-0"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                {t("modalTitle")}
              </h3>
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={closeLabel}
                  className="size-9 rounded-full text-[rgba(29,41,32,0.6)] hover:bg-black/5"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </SheetClose>
            </div>
            <div className="flex-1 overflow-hidden">{drawerList}</div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
