"use client";

import { Skeleton } from "@cf/ui";

export default function KycReviewLoader() {
  return (
    <div className={"w-full py-4"}>
      <div className={"flex h-12 w-full items-center justify-center border-b"}>
        <div className={"flex w-full items-center justify-between px-5"}>
          <Skeleton className={"h-4 w-4"} />
          <Skeleton className={"h-5 w-60"} />
          <div></div>
        </div>
      </div>
      <div className={"grid h-full grid-cols-5 gap-3"}>
        <div className={"col-span-1 border-r px-12 pt-10"}>
          <div className={"flex flex-col gap-2.5"}>
            <Skeleton className={"h-3 w-40"} />
            <Skeleton className={"h-3 w-32"} />
            <Skeleton className={"h-3 w-36"} />
          </div>
        </div>
        <div className={"col-span-3 px-4 pt-10"}>
          <Skeleton className={"h-5 w-60"} />
          <Skeleton className={"mt-4 h-20 w-full"} />
          <Skeleton className={"mt-4 h-20 w-full"} />
          <Skeleton className={"mt-4 h-20 w-full"} />
          <Skeleton className={"mt-4 h-20 w-full"} />
          <Skeleton className={"mt-4 h-20 w-full"} />
        </div>
        <div className={"col-span-1 border-l px-6 pt-10"}>
          <div className={"flex flex-col gap-4"}>
            <Skeleton className={"h-4 w-32"} />
            <div className={"flex flex-col gap-2"}>
              <Skeleton className={"h-3 w-32"} />
              <Skeleton className={"h-3 w-36"} />
              <Skeleton className={"h-3 w-32"} />
              <Skeleton className={"h-3 w-36"} />
              <Skeleton className={"h-3 w-32"} />
              <Skeleton className={"h-3 w-36"} />
              <Skeleton className={"h-3 w-36"} />
              <Skeleton className={"h-3 w-36"} />
              <Skeleton className={"h-3 w-36"} />
            </div>
          </div>

          <div className={"mt-4 flex flex-col gap-4"}>
            <Skeleton className={"h-4 w-32"} />
            <div className={"flex flex-col gap-2"}>
              <Skeleton className={"h-3 w-32"} />
              <Skeleton className={"h-3 w-36"} />
              <Skeleton className={"h-3 w-32"} />
              <Skeleton className={"h-3 w-36"} />
              <Skeleton className={"h-3 w-36"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
