"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@cf/ui";
import { Skeleton } from "@cf/ui/components/skeleton";

export default function SetupCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar skeleton */}
        <div className="mb-6">
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Three setup steps */}
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-start gap-4">
            {/* Step number circle */}
            <Skeleton className="size-10 shrink-0 rounded-full" />

            {/* Step content */}
            <div className="flex-1">
              <Skeleton className="mb-1 h-5 w-32" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>

            {/* Action button/checkmark */}
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
