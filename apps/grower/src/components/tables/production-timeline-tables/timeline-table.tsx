import { Button } from "@cf/ui";
import { MenuDeepIcon, SeedingIcon } from "@cf/ui/icons";
import { BoltIcon, SearchIcon, TractorIcon } from "@cf/ui/icons";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { ProductionPlanTask } from "./types";

interface WebProductionTableProps {
  tasks: ProductionPlanTask[];
  totalCost: string;
  onToggleView?: () => void;
}

export const WebProductionTable = ({
  tasks,
  totalCost,
  onToggleView,
}: WebProductionTableProps) => {
  const [visibleItems, setVisibleItems] = useState(8);

  const handleViewMore = () => {
    setVisibleItems((prev) => prev + 8);
  };

  const displayedTasks = tasks.slice(0, visibleItems);
  const hasMoreItems = visibleItems < tasks.length;

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

      {/* Table Header */}
      <div className="rounded-t-lg">
        <div className="grid grid-cols-5 gap-4 px-6 py-3 text-sm font-semibold">
          <div>Task name</div>
          <div>Start date</div>
          <div>End date</div>
          <div>Duration</div>
          <div className="text-right">Estimated cost</div>
        </div>
      </div>

      {/* Task List */}
      <div className="rounded-b-lg">
        {displayedTasks.map((task, index) => (
          <div
            key={task.id}
            className={`mb-3 grid grid-cols-5 gap-4 rounded-xl bg-white px-6 py-4 shadow-xl hover:bg-gray-50 ${
              index === displayedTasks.length - 1 ? "border-b-0" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`${task.color}`}>
                {getIconComponent(task.category)}
              </span>
              <div>
                <div className="text-sm font-thin">{task.name}</div>
                <div className="text-gray-dark text-sm font-thin">
                  {task.category}
                </div>
              </div>
            </div>
            <div className="flex items-center text-sm">{task.startDate}</div>
            <div className="flex items-center text-sm">{task.endDate}</div>
            <div className="flex items-center text-sm">{task.duration}</div>
            <div className="flex items-center justify-end text-sm">
              {task.cost}
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      {hasMoreItems && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="unstyled"
            className="text-primary font-semibold"
            onClick={handleViewMore}
          >
            View more
            <ChevronDown size={6} className="ml-2 !font-semibold" />
          </Button>
        </div>
      )}

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
