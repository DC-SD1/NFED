'use client';

import {Skeleton} from "@cf/ui";

export default function ActivityHistoryLoader() {
  return (
    <div className="flex size-full flex-col gap-4">
        {
            Array.from({length: 16}).map((_, index) => (
                <div key={index} className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2 w-40" />
                </div>
            ))
        }
    </div>
  );
}
