import { Button } from "@cf/ui";
import {
  BoltIcon,
  MenuDeepIcon,
  SearchIcon,
  SeedingIcon,
  TractorIcon,
} from "@cf/ui/icons";
import { ChevronDownCircle } from "lucide-react";
import { useState } from "react";

import type { ProductionPlanTask } from "./types";

interface MobileProductionTableProps {
  tasks: ProductionPlanTask[];
  totalCost: string;
  onToggleView?: () => void;
}
export const MobileProductionTable = ({
  tasks,
  totalCost,
  onToggleView,
}: MobileProductionTableProps) => {
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState(5);

  const getIconComponent = (category: string) => {
    switch (category) {
      case "Nursery":
      case "Planting":
        return <SeedingIcon />;
      case "Land preparation":
        return <TractorIcon />;
      case "IPM":
      case "Crop Care":
        return <SearchIcon />;
      default:
        return <BoltIcon />;
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const handleViewMore = () => {
    setVisibleItems((prev) => prev + 5);
  };

  const displayedTasks = tasks.slice(0, visibleItems);
  const hasMoreItems = visibleItems < tasks.length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-md">
          <div>
            <h2 className="text-md mb-4 flex items-center gap-2 text-xl font-semibold">
              Production plan schedule
              {tasks.length > 0 && (
                <div className="flex size-5 items-center justify-center rounded-full bg-black">
                  <span className="text-xs font-thin text-white">
                    {tasks.length}
                  </span>
                </div>
              )}
            </h2>
            <p className="text-gray-dark text-sm">
              Simplified overview of all planned activities
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleView}
            className="bg-gray-light hover:bg-gray-light/80 flex size-9 items-center justify-center rounded-full transition-colors"
            title="Switch to Gantt view"
          >
            <MenuDeepIcon />
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-4 px-4 py-3 text-sm font-semibold">
        <div>Plan name</div>
        <div className="text-right">Duration</div>
      </div>

      {/* Mobile Task List */}
      <div className="mb-10 w-full space-y-2 overflow-hidden">
        {displayedTasks.map((task) => {
          const isExpanded = expandedRowId === task.id;

          return (
            <div
              key={task.id}
              className="overflow-hidden rounded-xl border bg-white p-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <span className={`${task.color}`}>
                    {getIconComponent(task.category)}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-thin">{task.name}</div>
                    <div className="text-gray-dark text-xs">
                      {task.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-thin">Duration</span>
                    <span className="text-muted-foreground text-sm">
                      {task.duration}
                    </span>
                  </div>

                  <Button
                    size="icon"
                    variant="unstyled"
                    onClick={() => toggleExpand(task.id)}
                    aria-label="Expand row"
                  >
                    <ChevronDownCircle
                      className={`text-primary size-6 transition-transform ${
                        isExpanded ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-thin">Start date</span>
                        <span className="text-muted-foreground text-sm">
                          {task.startDate}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-thin">
                          Estimated cost
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {task.cost}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col px-8">
                      <span className="text-sm font-thin">End date</span>
                      <span className="text-muted-foreground text-sm">
                        {task.endDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {hasMoreItems && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleViewMore}
              variant="unstyled"
              className="text-primary rounded-full px-6 py-2"
            >
              Load more...
            </Button>
          </div>
        )}
      </div>

      {/* Total Cost */}
      <div className="bg-background-light mt-4 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-primary text-lg font-semibold">
            Total estimated cost
          </span>
          <span className="text-primary text-lg font-semibold">
            {totalCost}
          </span>
        </div>
      </div>
    </div>
  );
};
