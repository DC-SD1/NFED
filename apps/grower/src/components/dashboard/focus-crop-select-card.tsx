import { Button } from "@cf/ui";
import { ChevronRight } from "lucide-react";
import React from "react";

export const FocusCropSelectionCard = ({
  icon = "",
  title = "",
  startDate = "",
  endDate = "",
  className = "",
  onSelect = () => {
    //
  },
  disabled = false,
}) => {
  return (
    <div
      className={`relative rounded-xl border border-none bg-white p-3 shadow-sm transition-all hover:shadow-md ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="bg-gray-light flex size-9 items-center justify-center rounded-full">
          <div className="text-sm">{icon}</div>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col gap-3 sm:flex-row ">
          <div className="text-xs">
            Start date:{" "}
            <span className="text-gray-dark font-thin">{startDate}</span>
          </div>
          <div className="text-xs">
            End date:{" "}
            <span className="text-gray-dark font-thin">{endDate}</span>
          </div>
        </div>

        <Button
          onClick={disabled ? undefined : onSelect}
          disabled={disabled}
          variant="default"
          className="h-10 rounded-xl"
        >
          Select
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};
