"use client";

import { Button } from "@cf/ui/components/button";
import { Card, CardContent } from "@cf/ui/components/card";
import { Input } from "@cf/ui/components/input";
import { ChevronDown, Plus, Search } from "lucide-react";
import type React from "react";

import { exportIcon as ExportIcon } from "@/assets/icons/empty-state-farm-icons";

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
  onFilterChange?: (filter: string) => void;
  onAddClick?: () => void;
  onExportClick?: () => void;
  children?: React.ReactNode;
}

export default function EmptyStateWrapper({
  title: _title,
  addButtonText,
  showSearch = false,
  statCards,
  filterTabs = ["All"],
  activeFilter = "All",
  onFilterChange,
  onAddClick,
  onExportClick,
  children,
}: EmptyStateWrapperProps) {
  return (
    <div className="h-full max-w-[100vw] overflow-hidden">
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

        {/* Stats Cards */}
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

                    <p className="text-xl font-bold text-gray-300 sm:text-2xl">
                      {card.count}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          {/* Filters and Export */}
          <div className="mb-4 flex w-full items-end justify-between gap-2">
            <div className="relative flex min-w-0 flex-1 overflow-x-auto">
              <div className="flex w-full flex-nowrap">
                {filterTabs.map((tab) => (
                  <Button
                    key={tab}
                    variant="unstyled"
                    onClick={() => onFilterChange?.(tab)}
                    className={`relative whitespace-nowrap p-2 transition-colors duration-200 md:px-4 ${
                      activeFilter === tab
                        ? "text-primary"
                        : "hover:emphasize hover:text-primary text-gray-400 hover:cursor-pointer"
                    }`}
                  >
                    {tab}
                    <div
                      className={`absolute inset-x-0 bottom-0 h-0.5 ${
                        activeFilter === tab ? "bg-primary" : "bg-gray-200"
                      } rounded-full`}
                    />
                  </Button>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              <Button
                variant="outline"
                onClick={onExportClick}
                className="z-10 flex items-center gap-2 rounded-full bg-[#E8EBE1] sm:rounded-2xl"
              >
                <ExportIcon />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="hidden size-3 text-gray-900 sm:inline" />
              </Button>
            </div>
          </div>
          {/* Children Content */}
          {children && <div className="rounded-lg">{children}</div>}
        </div>
      </main>
    </div>
  );
}
