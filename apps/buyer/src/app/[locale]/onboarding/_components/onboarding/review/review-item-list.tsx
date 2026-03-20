"use client";

import { Button } from "@cf/ui";

interface ReviewItemListProps {
  label: string;
  value: string;
  hasViewButton?: boolean;
  onClick?: () => void;
  documentUrl?: string;
}

export function ReviewItemList({
  label,
  value,
  hasViewButton = false,
  onClick,
}: ReviewItemListProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-[#586665]">{label}</p>
        <p className="text-sm text-[#161D1D] lg:text-base">{value}</p>
      </div>

      {hasViewButton && (
        <Button
          className="bg-[#F5F5F5] font-semibold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))]"
          onClick={onClick}
        >
          View
        </Button>
      )}
    </div>
  );
}
