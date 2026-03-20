"use client";

import { Skeleton } from "@cf/ui";

export default function KycTabLoader() {
  return (
    <div className={"mt-4 flex flex-col gap-2"}>
      <Skeleton className={"h-4 w-40"} />
      <Skeleton className={"mt-4 h-0.5"} />
      <div className={"flex flex-col gap-2 py-2"}>
        <Skeleton className={"h-3 w-40"} />
        <Skeleton className={"h-3 w-24"} />
      </div>
      <div className={"flex flex-col gap-2 py-2"}>
        <Skeleton className={"h-3 w-40"} />
        <Skeleton className={"h-3 w-24"} />
      </div>
      <div className={"flex flex-col gap-2 py-2"}>
        <Skeleton className={"h-3 w-40"} />
        <Skeleton className={"h-3 w-24"} />
      </div>
      <div className={"flex flex-col gap-2 py-2"}>
        <Skeleton className={"h-3 w-40"} />
        <Skeleton className={"h-3 w-24"} />
      </div>
      <div className={"flex flex-col gap-2 py-2"}>
        <Skeleton className={"h-3 w-40"} />
        <Skeleton className={"h-3 w-24"} />
      </div>
      <div className={"flex flex-col gap-2 py-2"}>
        <Skeleton className={"h-3 w-40"} />
        <Skeleton className={"h-3 w-24"} />
      </div>
    </div>
  );
}
