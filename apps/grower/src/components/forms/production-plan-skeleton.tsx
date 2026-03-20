import { Skeleton } from "@cf/ui";

interface ProductionPlanSkeletonProps {
  isEditMode?: boolean;
}

export default function ProductionPlanSkeleton({
  isEditMode = false,
}: ProductionPlanSkeletonProps) {
  return (
    <div className="rounded-2xl bg-white shadow-xl">
      <div className="w-full p-2 lg:p-4">
        <div className="rounded-lg border-none bg-white">
          {/* Farm Information Card */}
          <div className="mb-8 rounded-2xl bg-white p-2 shadow-xl lg:p-4">
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Farm Details - 2 columns with proper layout matching FarmInfoSection */}
          <div className="mb-8 flex items-start justify-between gap-6 p-4">
            <div className="flex-1">
              <Skeleton className="mb-1 h-4 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex-1 text-right">
              <Skeleton className="mb-1 h-4 w-32" />
              <Skeleton className="ml-auto h-6 w-32" />
            </div>
          </div>

          {/* Crop Selection - 2 columns */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Crop Type - disabled in edit mode */}
            <div className="w-full">
              <Skeleton className="mb-4 h-4 w-24" />
              <div
                className={`flex h-12 w-full items-center justify-between rounded-lg border px-4 ${
                  isEditMode ? "bg-gray-100" : "bg-gray-50"
                }`}
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="size-6 rounded" />
              </div>
            </div>

            {/* Crop Variety */}
            <div className="w-full">
              <Skeleton className="mb-4 h-4 w-28" />
              <div className="flex h-12 w-full items-center justify-between rounded-lg border bg-gray-50 px-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="size-6 rounded" />
              </div>
            </div>
          </div>

          {/* Planting Window Results Card Skeleton (shown in edit mode) */}
          {isEditMode && (
            <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start space-x-3">
                <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-64" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-48" />
                    <div className="mt-3 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Date & Irrigation - 2 columns */}
          <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-2">
            <div className="w-full">
              <Skeleton className="mb-2 h-4 w-40" />
              <div className="relative">
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
            <div className="hidden lg:block" />
          </div>

          {/* Irrigation Checkbox */}
          <div className="mb-8 mt-6">
            <div className="flex cursor-pointer items-center space-x-3">
              <Skeleton className="size-10 rounded" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>

          {/* Button */}
          <div className="flex flex-row justify-start">
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
