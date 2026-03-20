import { Button } from "@cf/ui";
import { ChevronRight } from "lucide-react";
import React from "react";

export const CropSelectionCard = ({
  icon = "",
  title = "",
  company = "",
  landAcres = "",
  deliveryDate = "",
  className = "",
  tag = "",
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
          <p className="text-gray-dark text-xs">{company}</p>
        </div>
      </div>

      {tag && (
        <span className="text-blue-semi bg-blue-light absolute right-2 top-2 rounded-full px-1.5 text-[12px] font-extralight">
          {tag}
        </span>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col gap-3 sm:flex-row ">
          <div className="text-xs">
            Land acres:{" "}
            <span className="text-gray-dark font-thin">{landAcres}</span>
          </div>
          <div className="text-xs">
            Delivery:{" "}
            <span className="text-gray-dark font-thin">{deliveryDate}</span>
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
