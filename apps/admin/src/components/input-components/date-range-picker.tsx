"use client";

import {
  Button,
  Calendar,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cf/ui";
import { IconCircleXFilled } from "@tabler/icons-react";
import { format, parseISO, startOfDay, subDays, subYears } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

const EXTRA_DATES = [
  {
    label: "Last 7 days",
    value: "last7Days",
  },
  {
    label: "Last 30 days",
    value: "last30Days",
  },
  {
    label: "Last year",
    value: "lastYear",
  },
];

interface Props {
  className?: string;
  from?: Date;
  to?: Date;
  onDateChange?: (range: DateRange) => void;
  placeholder?: string;
  onClear?: () => void;
  hasFooterDates?: boolean;
  triggerClassName?: string;
}

export default function DateRangePicker({
  className,
  from,
  to,
  onDateChange,
  placeholder,
  onClear,
  hasFooterDates = true,
  triggerClassName,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = useState<DateRange | undefined>(
    Boolean(from) && Boolean(to)
      ? {
          from: from!,
          to: to!,
        }
      : undefined,
  );

  useEffect(() => {
    setDate(
      Boolean(from) && Boolean(to)
        ? {
            from: from!,
            to: to!,
          }
        : undefined,
    );
  }, [from, to]);

  const handleApply = () => {
    if (!date) return;
    onDateChange?.(date);
    setOpen(false);
  };

  const handleClear = () => {
    onClear?.();
    setDate(undefined);
  };

  const handleExtraDate = (value: string) => {
    const now = new Date();
    if (value === "last7Days") {
      setDate({ from: startOfDay(subDays(now, 7)), to: now });
    }
    if (value === "last30Days") {
      setDate({ from: startOfDay(subDays(now, 30)), to: now });
    }
    if (value === "lastYear") {
      setDate({ from: startOfDay(subYears(now, 1)), to: now });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        className={cn(
          "bg-input focus:ring-ring h-10 focus:outline-none focus:ring-2",
          className,
        )}
      >
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "bg-input text-foreground hover:bg-input hover:text-foreground w-full justify-between text-left font-normal",
            triggerClassName,
          )}
        >
          <div className={"flex items-center gap-2"}>
            <CalendarIcon className="size-4" />
            {from ? (
              to ? (
                <>
                  {format(from, "dd-MMM-yyyy")} - {format(to, "dd-MMM-yyyy")}
                </>
              ) : (
                format(from, "dd/MMM/yyyy")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          {from && to ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleClear();
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="cursor-pointer"
            >
              <IconCircleXFilled className="size-4" color="#161D14" />
            </span>
          ) : (
            <ChevronDown className="size-4 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={
            date?.from || parseISO(format(new Date(), "yyyy-MM-dd"))
          }
          selected={date}
          onSelect={(date) => {
            if (date) {
              setDate(date);
            }
          }}
          numberOfMonths={2}
        />
        <hr className={"bg-[#E5E8DF]"} />
        <div
          className={cn(
            "flex items-center justify-between px-5 py-4",
            !hasFooterDates && "justify-end",
          )}
        >
          {hasFooterDates && (
            <div className={"flex items-center gap-2"}>
              {EXTRA_DATES.map((extra, i) => (
                <button
                  key={`${extra.value}-${i}`}
                  onClick={() => handleExtraDate(extra.value)}
                  className={
                    "text-foreground rounded-full border border-[#E5E8DF] bg-transparent px-3 py-1.5 text-sm font-normal hover:bg-transparent"
                  }
                >
                  {extra.label}
                </button>
              ))}
            </div>
          )}

          <div className={"flex items-center gap-3"}>
            <Button onClick={handleClear} size={"sm"} variant={"secondary"}>
              Clear
            </Button>
            <Button onClick={handleApply} size={"sm"}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
