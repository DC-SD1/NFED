"use client";

import type { components } from "@cf/api";
import type { GanttFeature, GanttStatus } from "@cf/ui/components/gantt";
import { List } from "lucide-react";
import { useMemo, useState } from "react";

import GanttView from "@/components/farm-plan/production-activities/gantt-view";
import { MobileProductionTable } from "@/components/tables/production-timeline-tables/mobile-timeline-table";
import { WebProductionTable } from "@/components/tables/production-timeline-tables/timeline-table";
import type { ProductionPlanTask } from "@/components/tables/production-timeline-tables/types";
import { useIsMobile } from "@/hooks/use-is-mobile";

type ScheduleItem = components["schemas"]["PhysicsBasedScheduleItem"];

const parseLaborDays = (value?: string | null): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
};

interface ProductionTimelineProps {
  schedule: ScheduleItem[];
}

const ProductionTimeline = ({ schedule }: ProductionTimelineProps) => {
  const isMobile = useIsMobile();
  const [showGanttView, setShowGanttView] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getCategoryColor = (category?: string | null): string => {
    const categoryLower = (category ?? "").toLowerCase();
    if (categoryLower.includes("nursery")) return "text-green-600";
    if (categoryLower.includes("land")) return "text-amber-600";
    if (categoryLower.includes("plant")) return "text-green-600";
    if (categoryLower.includes("ipm")) return "text-blue-600";
    if (categoryLower.includes("fertilizer")) return "text-yellow-600";
    if (categoryLower.includes("crop care")) return "text-blue-600";
    return "text-gray-600";
  };

  const calculateEndDate = (
    startDate?: string | null,
    laborDays?: string | null,
  ): string => {
    if (!startDate) return "N/A";
    const date = new Date(startDate);
    const days = parseLaborDays(laborDays);
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const tasks: ProductionPlanTask[] = useMemo(
    () =>
      schedule.map((item, index) => ({
        id: index + 1,
        name: item.task ?? "N/A",
        category: item.stage ?? "N/A",
        startDate: formatDate(item.date),
        endDate: calculateEndDate(item.date, item.labor_days),
        duration: `${parseLaborDays(item.labor_days)} days`,
        cost: `GH₵ ${item.cost_ghs ?? "0"}`,
        color: getCategoryColor(item.category),
      })),
    [schedule],
  );

  const totalCost = useMemo(() => {
    const total = tasks.reduce((sum, task) => {
      const cost = parseFloat(task.cost.replace(/[^\d.]/g, ""));
      return sum + cost;
    }, 0);
    return `GH₵ ${total.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [tasks]);

  const ganttData = useMemo(() => {
    const statusMap = new Map<string, GanttStatus>();
    const groups: { status: GanttStatus; features: GanttFeature[] }[] = [];

    schedule.forEach((item, index) => {
      const stageName = item.stage ?? "Uncategorized";
      const categoryColor = getCategoryColor(item.category);
      const colorValue =
        categoryColor === "text-green-600"
          ? "#16a34a"
          : categoryColor === "text-amber-600"
            ? "#d97706"
            : categoryColor === "text-blue-600"
              ? "#2563eb"
              : categoryColor === "text-yellow-600"
                ? "#ca8a04"
                : "#4b5563";

      if (!statusMap.has(stageName)) {
        const status: GanttStatus = {
          id: `status-${statusMap.size}`,
          name: stageName,
          color: colorValue,
        };
        statusMap.set(stageName, status);
        groups.push({ status, features: [] });
      }

      const group = groups.find((g) => g.status.name === stageName);
      if (group) {
        const startDate = item.date ? new Date(item.date) : new Date();
        const laborDays = parseLaborDays(item.labor_days);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + laborDays);

        const feature: GanttFeature = {
          id: `task-${index}`,
          name: item.task ?? "Unnamed Task",
          startAt: startDate,
          endAt: endDate,
          status: group.status,
        };
        group.features.push(feature);
      }
    });

    return groups;
  }, [schedule]);

  const handleScrollLeft = () => {
    const element = document.querySelector("[data-gantt-scroll]");
    if (element) {
      element.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    const element = document.querySelector("[data-gantt-scroll]");
    if (element) {
      element.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div>
      {showGanttView ? (
        <div>
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-md">
            <div>
              <h2 className="text-md mb-2 flex items-center gap-2 text-xl font-semibold">
                Production plan schedule
                {schedule.length > 0 && (
                  <div className="flex size-5 items-center justify-center rounded-full bg-black">
                    <span className="text-xs font-thin text-white">
                      {schedule.length}
                    </span>
                  </div>
                )}
              </h2>
              <p className="text-sm text-gray-dark">
                Visual timeline of all planned activities
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGanttView(false)}
              className="flex size-9 items-center justify-center rounded-full bg-gray-light transition-colors hover:bg-gray-light/80"
              title="Switch to table view"
            >
              <List />
            </button>
          </div>
          <GanttView
            groups={ganttData}
            isExpanded={isExpanded}
            onToggleExpanded={() => setIsExpanded(!isExpanded)}
            onScrollLeft={handleScrollLeft}
            onScrollRight={handleScrollRight}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      ) : isMobile ? (
        <MobileProductionTable
          tasks={tasks}
          totalCost={totalCost}
          onToggleView={() => setShowGanttView(true)}
        />
      ) : (
        <WebProductionTable
          tasks={tasks}
          totalCost={totalCost}
          onToggleView={() => setShowGanttView(true)}
        />
      )}
    </div>
  );
};

export default ProductionTimeline;
