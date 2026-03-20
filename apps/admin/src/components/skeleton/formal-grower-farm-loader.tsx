"use client";

import { Skeleton } from "@cf/ui";

export default function FormalGrowerFarmLoader() {
  return (
    <div className={"flex flex-col gap-2"}>
      <div className="flex justify-between rounded-lg border px-5 py-6">
        <div className={"flex flex-col gap-4"}>
          <Skeleton className={"h-4 w-40"} />
          <Skeleton className={"h-2 w-20"} />
          <Skeleton className={"h-3 w-32"} />
        </div>
        <div>
          <Skeleton className={"size-20 rounded-xl"} />
        </div>
      </div>
      <div className="flex justify-between rounded-lg border px-5 py-6">
        <div className={"flex flex-col gap-4"}>
          <Skeleton className={"h-4 w-40"} />
          <Skeleton className={"h-2 w-20"} />
          <Skeleton className={"h-3 w-32"} />
        </div>
        <div>
          <Skeleton className={"size-20 rounded-xl"} />
        </div>
      </div>
    </div>
  );
}
