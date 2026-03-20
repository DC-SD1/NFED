"use client";

import { Card, CardContent } from "@cf/ui";
import { Skeleton } from "@cf/ui/components/skeleton";

export default function WelcomeCardSkeleton() {
  return (
    <Card className="w-full rounded-2xl border-none">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header with welcome message and weather widgets */}
          <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
            {/* Welcome title */}
            <Skeleton className="h-8 w-64" />

            {/* Weather widgets */}
            <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
              {/* Date widget */}
              <Skeleton className="h-10 w-28 rounded-full" />
              {/* Weather condition widget */}
              <Skeleton className="h-10 w-24 rounded-full" />
              {/* Temperature widget */}
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
          </div>

          {/* Subtitle text */}
          <Skeleton className="h-4 w-3/4" />

          {/* Bottom section with progress and help */}
          <div className="mt-4 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
            {/* Progress indicator */}
            <div className="h-7">
              <Skeleton className="h-6 w-40" />
            </div>

            {/* Help section */}
            <div className="text-left sm:text-right">
              <Skeleton className="mb-1 h-4 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
