"use client";

import { Skeleton } from "@cf/ui";

export default function FarmSearchFormSkeleton() {
  return (
    <div className="space-y-2">
      {/* Search Bar Skeleton */}
      <div className="relative w-full">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Farm Card List Skeletons */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="relative rounded-lg bg-white p-4 shadow-sm">
            {/* Radio Button Skeleton */}
            <div className="absolute right-4 top-4">
              <Skeleton className="size-5 rounded-full" />
            </div>

            <div className="flex items-center gap-2">
              {/* Map Preview Skeleton */}
              <Skeleton className="h-28 w-36 rounded md:w-48" />

              {/* Text Content Skeletons */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Button Skeleton */}
      <div className="!mt-8">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
