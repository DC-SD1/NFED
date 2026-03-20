/* eslint-disable max-lines-per-function */
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { type GanttFeature, type GanttStatus } from "@cf/ui/components/gantt";
import {
  addWeeks,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  endOfWeek,
  startOfWeek,
} from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { type RefObject, useMemo, useRef } from "react";

interface GanttViewProps {
  groups: { status: GanttStatus; features: GanttFeature[] }[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  scrollRef?: RefObject<HTMLDivElement>;
}

export default function GanttView({
  groups,
  isExpanded,
  onToggleExpanded,
  onScrollLeft,
  onScrollRight,
  selectedId,
  onSelect,
  scrollRef,
}: GanttViewProps) {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const effectiveScrollRef = scrollRef ?? internalScrollRef;
  const allFeatures = useMemo(
    () => groups.flatMap((g) => g.features),
    [groups],
  );
  const minStart = useMemo(
    () =>
      allFeatures.reduce(
        (min, f) => (f.startAt < min ? f.startAt : min),
        allFeatures[0]?.startAt ?? new Date(),
      ),
    [allFeatures],
  );
  const maxEnd = useMemo(
    () =>
      allFeatures.reduce(
        (max, f) => (f.endAt > max ? f.endAt : max),
        allFeatures[0]?.endAt ?? new Date(),
      ),
    [allFeatures],
  );
  const bufferWeeks = 2;
  const gridStartDate = useMemo(
    () => addWeeks(startOfWeek(minStart, { weekStartsOn: 1 }), -bufferWeeks),
    [minStart],
  );
  const gridEndDate = useMemo(
    () => addWeeks(endOfWeek(maxEnd, { weekStartsOn: 1 }), bufferWeeks),
    [maxEnd],
  );
  const weeksCount = useMemo(
    () =>
      Math.max(
        10,
        differenceInCalendarWeeks(gridEndDate, gridStartDate, {
          weekStartsOn: 1,
        }) + 1,
      ),
    [gridEndDate, gridStartDate],
  );
  const daysTotal = useMemo(
    () => differenceInCalendarDays(gridEndDate, gridStartDate) + 1,
    [gridEndDate, gridStartDate],
  );
  const weeks = useMemo(
    () => Array.from({ length: weeksCount }, (_, i) => i + 1),
    [weeksCount],
  );
  const msPerDay = 86_400_000;

  return (
    <div className="w-full min-w-0 max-w-[87vw] overflow-x-hidden">
      <div className="relative w-full min-w-0 max-w-full overflow-x-hidden">
        <div
          className={`w-full min-w-0 overflow-hidden rounded-lg ${isExpanded ? "min-h-[70vh] md:min-h-[600px]" : "h-80 md:h-[320px]"}`}
          style={{ minHeight: "320px", maxWidth: "100%" }}
        >
          <div
            ref={effectiveScrollRef}
            data-gantt-scroll
            className="relative size-full touch-pan-x touch-pan-y overflow-auto overscroll-contain [--col-w:32px] sm:[--col-w:40px] md:[--col-w:56px] lg:[--col-w:72px] xl:[--col-w:88px] 2xl:[--col-w:100px]"
            style={{
              WebkitOverflowScrolling: "touch",
              // ✅ Horizontal scroll with responsive column width via CSS var
            }}
          >
            <div
              className="inline-flex"
              style={{
                width: `calc(clamp(72px, 20vw, 160px) + var(--col-w) * ${weeksCount})`,
              }}
            >
              <div
                className="sticky left-0 z-10 shrink-0 bg-[#FBFBFB] shadow-sm"
                // ✅ Responsive sidebar width - narrower on mobile
                style={{
                  width: "clamp(72px, 20vw, 160px)",
                  minWidth: "72px",
                }}
              >
                <div className="border-border/50 h-12 border-b" />
                <TooltipProvider delayDuration={0}>
                  {groups.map((group) => (
                    <div key={group.status.id} className="py-1">
                      <div className="divide-border/50 divide-y">
                        {group.features.map((feature) => (
                          <Tooltip key={feature.id}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={`hover:bg-secondary/50 relative flex w-full items-start gap-0 px-0.5 py-1 text-xs sm:gap-0 sm:px-1 sm:py-1.5 ${
                                  selectedId === feature.id
                                    ? "border-l-2 border-l-blue-500 bg-blue-50/50"
                                    : ""
                                }`}
                                onClick={() => onSelect(feature.id)}
                              >
                                <div className="pointer-events-none flex min-w-0 flex-1 flex-col text-left">
                                  <p className="truncate text-[7px] font-medium sm:text-[9px] md:text-[11px]">
                                    {feature.name}
                                  </p>
                                  <p className="text-muted-foreground truncate text-[6px] sm:text-[8px] md:text-[10px]">
                                    {group.status.name}
                                  </p>
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              {feature.name}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  ))}
                </TooltipProvider>
              </div>
              <div className="relative flex-1">
                <div className="border-border/50 sticky top-0 z-50 flex h-12 border-b bg-[#FBFBFB]">
                  {weeks.map((week) => (
                    <div
                      key={week}
                      className="border-border/50 z-40 shrink-0 border-r px-0 py-1 text-center text-xs font-medium sm:px-0.5"
                      style={{
                        width: "var(--col-w)",
                        minWidth: "var(--col-w)",
                      }}
                    >
                      {/* ✅ Responsive horizontal layout */}
                      <div className="flex items-center justify-center">
                        <span className="whitespace-nowrap text-[6px] sm:text-[8px] md:text-xs">
                          {/* Mobile: just number */}
                          <span className="sm:hidden">{week}</span>
                          {/* Tablet: W1, W2, etc */}
                          <span className="hidden sm:inline lg:hidden">
                            W{week}
                          </span>
                          {/* Desktop and up: Week 1, Week 2, etc */}
                          <span className="hidden lg:inline">Week {week}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  {groups.map((group) => (
                    <div key={group.status.id} className="py-1">
                      <div className="divide-border/50 divide-y">
                        {group.features.map((feature) => (
                          <div key={feature.id} className="relative z-0">
                            {/* ✅ IDENTICAL button structure as left sidebar - but invisible */}
                            <button
                              type="button"
                              className="hover:bg-secondary/50 pointer-events-none relative flex w-full items-start gap-0 px-0.5 py-1 text-xs opacity-0 sm:gap-0 sm:px-1 sm:py-1.5"
                              title={feature.name}
                            >
                              <div className="pointer-events-none flex min-w-0 flex-1 flex-col text-left">
                                <p className="truncate text-[7px] font-medium sm:text-[9px] md:text-[11px]">
                                  {feature.name}
                                </p>
                                <p className="text-muted-foreground truncate text-[6px] sm:text-[8px] md:text-[10px]">
                                  {group.status.name}
                                </p>
                              </div>
                            </button>

                            {/* ✅ Timeline grid positioned absolutely over invisible button */}
                            <div className="absolute inset-0 z-0 flex">
                              {weeks.map((week) => (
                                <div
                                  key={week}
                                  className="border-border/50 shrink-0 border-r"
                                  style={{
                                    width: "var(--col-w)",
                                    minWidth: "var(--col-w)",
                                  }}
                                />
                              ))}
                            </div>

                            {/* ✅ Gantt bar positioned absolutely */}
                            {(() => {
                              const startDays =
                                (feature.startAt.getTime() -
                                  gridStartDate.getTime()) /
                                msPerDay;
                              const endDays =
                                (feature.endAt.getTime() -
                                  gridStartDate.getTime()) /
                                msPerDay;
                              const visibleStart = Math.max(0, startDays);
                              const visibleEnd = Math.min(daysTotal, endDays);
                              const widthDays = Math.max(
                                0,
                                visibleEnd - visibleStart,
                              );
                              const minDays = 1 / 7;
                              // ✅ Position relative to grid start (already includes buffer)
                              const leftRatio = visibleStart / 7;
                              const widthRatio = Math.max(
                                widthDays / 7,
                                minDays,
                              );

                              // ✅ Only hide if no visible width
                              if (widthDays <= 0) return null;
                              return (
                                <div
                                  className="pointer-events-none absolute inset-y-0 z-10 flex items-center"
                                  style={{
                                    left: `calc(var(--col-w) * ${leftRatio})`,
                                    width: `calc(var(--col-w) * ${widthRatio})`,
                                  }}
                                >
                                  <div
                                    className="h-6 w-full rounded-full"
                                    style={{
                                      backgroundColor: "#C9F0D6",
                                    }}
                                    title={feature.name}
                                  >
                                    <div className="flex size-full items-center overflow-hidden rounded-full px-2">
                                      <p className="truncate text-[9px] text-black sm:text-[10px] md:text-[11px]">
                                        {feature.name}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex flex-1 justify-center">
            <Button
              variant="ghost"
              onClick={onToggleExpanded}
              className="text-primary gap-2 text-xs sm:text-sm"
            >
              {isExpanded ? (
                <>
                  <span className="hidden sm:inline">View less</span>
                  <span className="sm:hidden">Less</span>
                  <ChevronUp className="size-4" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    View full plan schedule
                  </span>
                  <span className="sm:hidden">Full schedule</span>
                  <ChevronDown className="size-4" />
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onScrollLeft}
              className="hidden sm:flex"
            >
              <ChevronLeft className="text-primary size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onScrollRight}
              className="hidden sm:flex"
            >
              <ChevronRight className="text-primary size-4" />
            </Button>
            <div className="flex gap-1 sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={onScrollLeft}
                className="text-xs"
              >
                <ChevronLeft className="text-primary size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onScrollRight}
                className="text-xs"
              >
                <ChevronRight className="text-primary size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
