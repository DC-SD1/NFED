"use client";

import { cn } from "@cf/ui";
import { Button } from "@cf/ui/components/button";
import { Card, CardContent } from "@cf/ui/components/card";
import { Input } from "@cf/ui/components/input";
import { exportIcon as ExportIcon } from "@cf/ui/icons";
import { ChevronDown, Plus, Search } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import StatsSkeleton from "./skeletons/stats-card-skeleton";

interface StatCard {
  title: string;
  count: number;
  icon: React.ReactNode;
  bgColor: string;
}

interface EmptyStateWrapperProps {
  title: string;
  addButtonText: string;
  showSearch?: boolean;
  statCards: StatCard[];
  filterTabs?: string[];
  activeFilter?: string;
  isLoading?: boolean;
  onFilterChange?: (filter: string) => void;
  onAddClick?: () => void;
  onExportClick?: () => void;
  showAddButton?: boolean;
  showStatsCards?: boolean;
  showExportButton?: boolean;
  containerClassName?: string;
  contentClassName?: string;
  filterTabsClassName?: string;
  showFilterTabsLine?: boolean;
  children?: React.ReactNode;
}

export default function EmptyStateWrapper({
  title: _title,
  addButtonText,
  showSearch = false,
  statCards,
  filterTabs = ["All"],
  activeFilter = "All",
  isLoading = false,
  onFilterChange,
  onAddClick,
  onExportClick,
  showAddButton = true,
  showStatsCards = true,
  showExportButton = true,
  showFilterTabsLine = true,
  containerClassName = "",
  contentClassName = "",
  filterTabsClassName = "",
  children,
}: EmptyStateWrapperProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabContainerRef = useRef<HTMLDivElement | null>(null);
  const [underlineStyle, setUnderlineStyle] = useState({
    left: "0px",
    width: "0px",
  });
  const [backgroundLineWidth, setBackgroundLineWidth] = useState("100%");

  useEffect(() => {
    const el = tabRefs.current[activeFilter];
    if (el) {
      const { offsetLeft, offsetWidth } = el;
      setUnderlineStyle({ left: `${offsetLeft}px`, width: `${offsetWidth}px` });
    }

    // Calculate the full width needed for all tabs
    if (tabContainerRef.current) {
      const container = tabContainerRef.current;
      const totalWidth = Array.from(container.children).reduce(
        (total, child) => {
          if (child instanceof HTMLElement && child.tagName === "BUTTON") {
            return total + child.offsetWidth;
          }
          return total;
        },
        0,
      );

      setBackgroundLineWidth(`${totalWidth}px`);
    }
  }, [activeFilter, filterTabs]);

  return (
    <div
      className={cn(
        "h-full max-w-[97vw] items-center justify-center overflow-hidden px-2 lg:px-6",
        containerClassName,
      )}
    >
      {/* Header */}
      {/* <header className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="hidden text-3xl font-semibold text-gray-900 sm:block">
                {title}
              </h1>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="space-y-6 py-2">
        {/* Mobile title */}
        {/* <h1 className="text-xl font-semibold text-gray-900 sm:hidden">
          {title}
        </h1> */}

        {/* Add Button and Search */}
        {showAddButton && (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Button
              onClick={onAddClick}
              className="bg-primary rounded-2xl text-white hover:bg-green-600"
            >
              {addButtonText}
              <Plus className="mr-2 size-4" />
            </Button>

            {showSearch && (
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search"
                  className="border-0 bg-gray-100 pl-10"
                />
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        {showStatsCards &&
          (isLoading ? (
            <StatsSkeleton count={statCards.length || 4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map((card, index) => (
                <Card
                  key={index}
                  className="rounded-2xl border-none bg-white shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${card.bgColor}`}
                      >
                        {card.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-poppins mb-1 break-words text-xs font-normal leading-[18px] text-[var(--Schemes-Surface-Variant,#71786C)] sm:text-sm">
                          {card.title}
                        </p>
                        <p
                          className={`text-lg font-semibold ${card.count === 0 ? "text-gray-semi" : "text-black"}`}
                        >
                          {card.count}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}

        <div
          className={cn(
            "bg-empty-state-background rounded-2xl p-5 shadow-xl",
            contentClassName,
          )}
        >
          {/* Filters and Export */}
          {filterTabs.length > 0 && (
            <div
              className={cn(
                "mb-4 flex w-full items-end justify-between gap-2 rounded-2xl bg-white p-4",
                filterTabsClassName,
              )}
            >
              <div
                ref={tabContainerRef}
                className="relative flex w-full min-w-0 flex-nowrap overflow-x-auto"
              >
                {/* Tabs */}
                {filterTabs.map((tab) => (
                  <Button
                    key={tab}
                    ref={(el) => {
                      tabRefs.current[tab] = el;
                    }}
                    variant="unstyled"
                    onClick={() => onFilterChange?.(tab)}
                    className={`relative whitespace-nowrap p-2 transition-colors duration-200 md:px-4 ${
                      activeFilter === tab
                        ? "text-primary"
                        : "hover:emphasize hover:text-primary text-gray-400 hover:cursor-pointer"
                    }`}
                  >
                    {tab}
                  </Button>
                ))}

                {/* Background line across full width of all tabs */}
                {showFilterTabsLine && (
                  <div
                    className="bg-gray-light absolute bottom-0 h-0.5 w-full rounded-full"
                    style={{
                      left: "0px",
                      minWidth: backgroundLineWidth,
                    }}
                  />
                )}

                {/* Active tab underline */}
                <div
                  className="bg-primary z-index-1 absolute bottom-0 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    left: underlineStyle.left,
                    width: underlineStyle.width,
                  }}
                />
              </div>
              {/* Export Button */}
              {showExportButton && (
                <div className="shrink-0">
                  <Button
                    variant="unstyled"
                    onClick={onExportClick}
                    className="z-10 hidden items-center gap-2 bg-[#E8EBE1] xl:flex"
                  >
                    <ExportIcon />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown className="hidden size-3 text-gray-900 sm:inline" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Table content */}
          {children && <div className="rounded-lg">{children}</div>}
        </div>
      </main>
    </div>
  );
}
