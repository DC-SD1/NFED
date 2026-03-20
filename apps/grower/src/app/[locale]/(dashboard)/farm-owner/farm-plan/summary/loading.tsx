import { Skeleton } from "@cf/ui";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";

export default function FarmPlanSummaryLoading() {
  return (
    <TopLeftHeaderLayout buttonClassName="px-2">
      <div className="flex min-h-screen flex-col items-center px-2 lg:px-4">
        <div className="max-w-[95vw] space-y-6 pt-4 md:pt-6 lg:pt-6">
          {/* Header Text Skeleton */}
          <div className="text-left">
            <Skeleton className="mb-2 h-9 w-64 md:h-10 lg:h-12" />
            <Skeleton className="mb-3 h-5 w-96" />
            <div className="mt-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-0.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="ml-3.5 h-4 w-48" />
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="mb-6">
            <div className="mb-4 flex gap-4 rounded-2xl bg-white p-4 shadow-md">
              <Skeleton className="h-10 w-40 rounded-xl" />
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>

            {/* Farm Dashboard Card Skeleton */}
            <div className="rounded-2xl bg-white p-4 shadow-md">
              <Skeleton className="mb-4 h-6 w-48" />

              {/* Location and Date Info */}
              <div className="text-gray-dark mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>

              {/* Farm Details Grid Skeleton */}
              <div className="mb-6 flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl lg:flex-row lg:items-center lg:justify-between">
                <div className="grid flex-1 grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="mb-1 h-4 w-24" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Farm This Plan Button */}
              <div className="flex items-center justify-end">
                <Skeleton className="h-10 w-40 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Soil Analysis Section Skeleton */}
          <div className="mb-6 rounded-2xl bg-white p-4">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Skeleton className="mb-1 h-6 w-40" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-left sm:text-right">
                <Skeleton className="mb-1 h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>

            {/* Metrics Cards Skeleton */}
            <div className="mb-8 w-full">
              <div className="overflow-x-auto overflow-y-hidden">
                <div className="flex gap-6 pb-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-[204px] shrink-0 lg:w-[300px]">
                      <div className="animate-pulse rounded-xl bg-gray-100 p-6">
                        <Skeleton className="mb-2 h-4 w-32" />
                        <Skeleton className="mb-1 h-8 w-24" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <hr className="text-gray-dark my-5 h-0.5" />

            {/* Bottom Farm Details Grid Skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <div>
                <Skeleton className="mb-4 h-5 w-48" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div>
                <Skeleton className="mb-4 h-5 w-48" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </div>

          {/* Tabs Section Skeleton */}
          <div className="w-full rounded-2xl bg-white p-4 shadow-md">
            {/* Tab Headers Skeleton */}
            <div className="border-gray-light mb-6 flex gap-6 border-b pb-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-24" />
              ))}
            </div>

            {/* Tab Content Skeleton - Overview Tab */}
            <div className="space-y-6">
              {/* Cost Breakdown and Production Timeline Grid */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Cost Breakdown Skeleton */}
                <div>
                  <Skeleton className="mb-4 h-6 w-40" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-userDropdown-background flex items-center justify-between rounded-2xl p-4"
                      >
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Production Timeline Skeleton */}
                <div>
                  <Skeleton className="mb-4 h-6 w-48" />
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-2xl bg-gray-100 p-4"
                      >
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Crop-Specific Information Skeleton */}
              <div className="bg-userDropdown-background rounded-2xl p-4">
                <Skeleton className="mb-4 h-6 w-56" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-row gap-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Plan Button Skeleton */}
          <div className="my-14 flex w-full items-center justify-center">
            <Skeleton className="h-11 w-1/2 rounded-xl" />
          </div>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
