"use client";

import { Button } from "@cf/ui/components/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";

import type { ActivityUI } from "./utils";

interface TableViewProps {
  activities: ActivityUI[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedItems: Set<string>;
  onToggleItem: (id: string) => void;
}

export default function TableView({
  activities,
  isExpanded,
  onToggleExpanded,
  selectedId,
  onSelect,
  expandedItems,
  onToggleItem,
}: TableViewProps) {
  const t = useTranslations("farmPlan.planSummary");
  const displayed = isExpanded ? activities : activities.slice(0, 6);

  return (
    <div className="w-full">
      <div className="hidden md:block">
        <div className="space-y-2">
          <div
            className="text-foreground grid gap-4 px-4 py-2 text-sm font-medium"
            style={{ gridTemplateColumns: "2.5fr 2.5fr 1.5fr 1.5fr 1fr 1fr" }}
          >
            <div className="text-left">{t("stage")}</div>
            <div className="text-left">{t("activity")}</div>
            <div className="text-center text-sm">{t("durationWeek")}</div>
            <div className="text-center">{t("costRangeGHS")}</div>
            <div className="text-center">{t("startWeek")}</div>
            <div className="text-center">{t("endWeek")}</div>
          </div>
          {displayed.map((a) => (
            <div
              key={a.id}
              className="mx-2 grid items-center gap-4 rounded-lg bg-white px-4 py-3 text-sm shadow-sm"
              style={{ gridTemplateColumns: "2.5fr 2.5fr 1.5fr 1.5fr 1fr 1fr" }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(a.id)}
                  className="shrink-0"
                  aria-label={`Select ${a.activity}`}
                >
                  <div className="flex size-6 items-center justify-center rounded-full border-2 border-[#E5E8DF]">
                    {selectedId === a.id && (
                      <div className="bg-primary size-3 rounded-full" />
                    )}
                  </div>
                </button>
                <div
                  className="h-6 w-1 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
                <span className="text-sm font-medium">{a.stage}</span>
              </div>
              <div className="text-left">{a.activity}</div>
              <div className="text-center">{a.duration}</div>
              <div className="text-center">GHS{a.costRange}</div>
              <div className="text-center">{a.startWeek}</div>
              <div className="text-center">{a.endWeek}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:hidden">
        <div className="space-y-2">
          {displayed.map((a) => {
            const open = expandedItems.has(a.id);
            return (
              <div
                key={a.id}
                className="overflow-hidden rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-center justify-center p-2">
                  <button
                    onClick={() => onSelect(a.id)}
                    className="mr-3 shrink-0"
                    aria-label={`Select ${a.activity}`}
                  >
                    <div className="flex size-6 items-center justify-center rounded-full border-2 border-[#E5E8DF]">
                      {selectedId === a.id && (
                        <div className="bg-primary size-3 rounded-full" />
                      )}
                    </div>
                  </button>
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-1 rounded-full"
                        style={{ backgroundColor: a.color }}
                      />
                      <span className="text-sm font-medium">{a.stage}</span>
                    </div>
                    <button
                      onClick={() => onToggleItem(a.id)}
                      aria-label={`${open ? "Collapse" : "Expand"} ${a.activity} details`}
                    >
                      <div className="border-primary flex size-6 items-center justify-center rounded-full border-2">
                        <ChevronDown
                          className={`text-primary size-4 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
                {open && (
                  <div className="px-1 pb-4">
                    <div className="border-t" />
                    <div className="space-y-3 px-10 pt-3">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between py-1">
                          <span className="text-foreground font-medium">
                            {t("stage")}
                          </span>
                          <span className="text-muted-foreground text-right font-medium">
                            {a.stage}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-foreground font-medium">
                            {t("activity")}
                          </span>
                          <span className="text-muted-foreground text-right font-medium">
                            {a.activity}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-foreground font-medium">
                            {t("duration")}
                          </span>
                          <span className="text-muted-foreground text-right font-medium">
                            {a.duration} {t("week")}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground font-medium">
                            {t("costRangeGHS")}
                          </span>
                          <span className="text-muted-foreground text-right font-medium">
                            GHS{a.costRange}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-foreground font-medium">
                            {t("startWeek")}
                          </span>
                          <span className="text-muted-foreground text-right font-medium">
                            {a.startWeek}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-foreground font-medium">
                            {t("endWeek")}
                          </span>
                          <span className="text-muted-foreground text-right font-medium">
                            {a.endWeek}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {activities.length > 3 && (
        <div className="mt-2">
          <Button
            variant="ghost"
            onClick={onToggleExpanded}
            className="text-primary w-full justify-center gap-2"
          >
            {isExpanded ? (
              <>
                {t("viewLess")} <ChevronUp className="size-4" />
              </>
            ) : (
              <>
                {t("viewFullActivitiesList")} <ChevronDown className="size-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
