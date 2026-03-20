"use client";

import { Skeleton } from "@cf/ui";

export default function CustomerDetailLoader() {
  return (
    <div className="relative">
      <div
        className={"flex flex-col gap-4 py-4 sm:flex-row sm:justify-between"}
      >
        <div className={"flex flex-col gap-2"}>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-52" />
        </div>
        <div className={"flex items-center gap-4"}>
          <Skeleton className="h-9 w-full sm:w-32" />
          <Skeleton className="size-9" />
        </div>
      </div>
      <Skeleton className="-mx-10 h-0.5" />
      <div className={"flex items-center gap-4 py-3"}>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-24" />
      </div>
      <Skeleton className="-mx-10 h-0.5" />

      <div
        className={
          "absolute right-0 top-40 -mr-9 h-10 w-[30%] bg-white sm:top-28"
        }
      >
        <Skeleton className="size-9" />
      </div>

      <div className={"flex w-full gap-0 py-4 sm:gap-16"}>
        <div className={"w-0 sm:w-full"}>
          <div className={"flex items-center justify-between gap-4"}>
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className={"mt-4 grid grid-cols-3 gap-4"}>
            <div className={"col-span-1"}>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className={"col-span-1"}>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className={"col-span-1"}>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>

          <div className={"mt-4 grid grid-cols-2 gap-4"}>
            <div className={"col-span-1"}>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className={"col-span-1"}>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className={"col-span-1"}>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className={"col-span-1"}>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>

        <div className={"w-full p-4 sm:w-1/3"}>
          <div className={"flex items-center justify-between gap-4"}>
            <Skeleton className="size-16 rounded-full" />
            <div className={"flex flex-col gap-2"}>
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className={"mt-4"}>
            <div className={"flex flex-col gap-4"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={"flex items-center gap-2"}>
                  <div className={"w-1/2"}>
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className={"w-1/2"}>
                    <Skeleton className="h-3 " />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Skeleton className="-mx-6 mt-4 h-0.5" />
          <div className={"flex justify-center py-2"}>
            <Skeleton className="h-7 w-24" />
          </div>
          <Skeleton className="-mx-6 h-0.5" />

          <div className={"mt-4"}>
            <div className={"flex items-center justify-between py-2"}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className={"mt-3 flex flex-col gap-2"}>
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
