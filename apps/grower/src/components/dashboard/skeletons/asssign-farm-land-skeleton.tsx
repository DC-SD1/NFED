import { Card, CardContent, CardHeader, Skeleton } from "@cf/ui";
import React from "react";

const AssignedFarmLandsSkeleton = () => {
  return (
    <div className="size-full h-96 rounded-3xl border-none bg-white p-3">
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
    </div>
  );
};

export default AssignedFarmLandsSkeleton;
