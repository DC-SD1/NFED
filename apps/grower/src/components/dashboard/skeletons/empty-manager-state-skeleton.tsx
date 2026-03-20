"use client";

import { Card, CardContent } from "@cf/ui";
import { ChevronDown } from "lucide-react";
import type React from "react";

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
  <div className={`bg-gray-light animate-pulse rounded ${className}`} />
);

export default function ManagerStateSkeletonWrapper() {
  return (
    <div className="h-full max-w-[97vw] items-center justify-center overflow-hidden lg:px-6">
      {/* Main Content */}
      <main className="space-y-6 py-2">
        {/* Add Button and Search */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-32 rounded-2xl" />
          <div className="relative w-full sm:w-80">
            <Skeleton className="bg-gray-light h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-2xl border-none bg-white shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <div className="bg-gray-light flex size-10 shrink-0 items-center justify-center rounded-full">
                    <Skeleton className="size-6 rounded-full bg-gray-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-3 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area - matches the bg-empty-state-background rounded-2xl styling */}
        <div className="bg-empty-state-background rounded-2xl p-5 shadow-xl">
          {/* Filters and Export Header */}
          <div className="mb-4 flex w-full items-end justify-between gap-2">
            {/* Filter Tabs - matching the actual flex layout */}
            <div className="relative flex min-w-0 flex-1 overflow-x-auto">
              <div className="flex w-full flex-nowrap">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative whitespace-nowrap p-2 md:px-4"
                  >
                    <Skeleton className="h-4 w-12" />
                    {/* Bottom border line - matches the actual design */}
                    <div className="bg-gray-light absolute inset-x-0 bottom-0 h-0.5 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button - matches the actual styling */}
            <div className="shrink-0">
              <div className="z-10 flex items-center gap-2 rounded-full bg-[#E8EBE1] px-3 py-2 sm:rounded-2xl">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="hidden h-4 w-12 sm:block" />
                <ChevronDown className="hidden size-3 text-gray-900 sm:inline" />
              </div>
            </div>
          </div>

          <div className="rounded-lg">
            {/* Table Header */}
            <div className="mb-4 grid grid-cols-12 gap-4 px-2">
              <div className="col-span-1">
                <Skeleton className="size-4 rounded" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="col-span-2">
                <Skeleton className="w-18 h-4" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="col-span-1">
                <Skeleton className="h-4 w-8" />
              </div>
            </div>

            {/* Table Rows */}
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 items-center gap-4 rounded-lg bg-white px-2 py-3"
                >
                  <div className="col-span-1">
                    <Skeleton className="size-4 rounded" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="w-18 h-4" />
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="col-span-1 flex gap-1">
                    <Skeleton className="size-6 rounded" />
                    <Skeleton className="size-6 rounded" />
                    <Skeleton className="size-6 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded" />
                <Skeleton className="size-8 rounded" />
                <Skeleton className="size-8 rounded" />
                <Skeleton className="size-8 rounded" />
                <Skeleton className="size-8 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
