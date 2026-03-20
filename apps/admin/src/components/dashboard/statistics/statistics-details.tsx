"use client";

import {
  Badge,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@cf/ui";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClockHour4,
  IconDownload,
  IconPrinter,
  IconX,
} from "@tabler/icons-react";
import React from "react";


const statusColors: Record<string, string> = {
  Paid: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
  Success: "bg-green-50 text-green-700 border-green-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
};

const statusIcons: Record<string, React.ElementType> = {
  Paid: IconCircleCheck,
  Pending: IconClockHour4,
  Overdue: IconAlertTriangle,
  Success: IconCircleCheck,
  Failed: IconAlertTriangle,
};


type Field<T> = {
  label: string;
  value: (data: T) => React.ReactNode;
};

type Props<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: T | null;

  title?: string;

  status?: (data: T) => string;

  fields: Field<T>[];

  primary?: (data: T) => React.ReactNode;

  extraSections?: React.ReactNode;
};

export function DetailSheet<T>({
  open,
  onOpenChange,
  data,
  title = "Detail",
  status,
  primary,
  fields,
  extraSections,
}: Props<T>) {
  if (!data) return null;

  const statusValue = status?.(data);
  const Icon = statusValue ? statusIcons[statusValue] : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader>
          <div className="flex w-full items-center justify-between gap-2 border-b pb-2">
            <SheetClose>
              <IconX className="border-r pr-2" />
            </SheetClose>

            <SheetTitle>{title}</SheetTitle>

            <button className="rounded-lg bg-[#EDF0E6] px-2 py-1 text-sm font-bold text-[#1A5514] hover:bg-green-500 hover:text-white">
              Action
            </button>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-4">
          {/* Status */}
          {statusValue && (
            <div className="px-4 mb-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs">{title}</span>
                <h2 className="text-lg font-semibold">
                  {primary ? primary(data) : "-"}
                </h2>
              </div>

              <Badge
                className={`${statusColors[statusValue]} flex items-center gap-1 border text-xs`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {statusValue}
              </Badge>
            </div>
          )}

          {/* Fields */}
          <div className="mt-4 space-y-3 px-4">
            <h3 className="border-b pb-2 text-sm font-semibold text-slate-700">
              Details
            </h3>

            <div className="grid grid-cols-2 gap-y-4 text-xs">
              {fields.map((field, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-slate-500">{field.label}</span>
                  <span className="font-bold">
                    {field.value(data)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Extra Sections */}
          {extraSections}
        </div>

        {/* Footer */}
        <SheetFooter className="border-t px-4 py-2 flex gap-2">
          <button className="flex gap-1 rounded-lg bg-[#EDF0E6] px-2 py-1 text-sm font-bold text-[#1A5514] hover:bg-green-500 hover:text-white">
            <IconPrinter size={16} />
            Print
          </button>

          <button className="flex gap-1 rounded-lg bg-[#EDF0E6] px-2 py-1 text-sm font-bold text-[#1A5514] hover:bg-green-500 hover:text-white">
            <IconDownload size={16} />
            Download
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet >
  );
}