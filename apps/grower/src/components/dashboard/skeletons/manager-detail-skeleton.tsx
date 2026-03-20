"use client";

import { Card, CardContent, CardHeader } from "@cf/ui";
import { Skeleton } from "@cf/ui/components/skeleton";

export default function ManagerDetailsSkeleton() {
  return (
    <div className="w-full space-y-6 px-4 py-6">
      {/* User Profile Skeleton */}
      <Card className="w-full rounded-3xl border-none">
        <CardContent className="relative p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 animate-pulse rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 animate-pulse" />
              <Skeleton className="h-4 w-24 animate-pulse" />
            </div>
          </div>
          <div className="absolute right-6 top-6 mt-4 hidden gap-4 lg:flex">
            <Skeleton className="h-16 w-32 animate-pulse rounded-lg" />
            <Skeleton className="h-16 w-32 animate-pulse rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Grid layout */}
      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Left column (2/5 width) */}
        <div className="flex flex-col gap-6 xl:w-2/5">
          {/* Personal Details */}
          <Card className="w-full rounded-3xl border-none">
            <CardHeader>
              <Skeleton className="h-5 w-40 animate-pulse" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="mb-1 h-4 w-24 animate-pulse" />
                  <Skeleton className="h-5 w-full animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Address Details */}
          <Card className=" w-full rounded-3xl border-none">
            <CardHeader>
              <Skeleton className="h-5 w-40 animate-pulse" />
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="mb-1 h-4 w-24 animate-pulse" />
                  <Skeleton className="h-5 w-full animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column (3/5 width) */}
        <div className="flex flex-col gap-6 xl:w-3/5">
          {/* Assigned Farm Lands */}
          <Card className="w-full rounded-3xl border-none">
            <CardHeader>
              <Skeleton className="h-5 w-48 animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-20 w-36 animate-pulse rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2 animate-pulse" />
                    <Skeleton className="h-4 w-1/3 animate-pulse" />
                    <Skeleton className="h-4 w-1/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="w-full rounded-3xl border-none">
            <CardHeader>
              <Skeleton className="h-5 w-40 animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full animate-pulse" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
