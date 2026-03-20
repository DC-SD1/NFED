interface FarmCardSkeletonProps {
  count?: number;
}

export default function FarmCardSkeleton({ count = 3 }: FarmCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative animate-pulse rounded-md p-2 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {/* Map skeleton */}
              <div className="h-[90px] w-[105px] rounded bg-gray-200"></div>
            </div>

            <div className="flex-1 space-y-2">
              {/* Farm name skeleton */}
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              {/* Acres skeleton */}
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              {/* Region skeleton */}
              <div className="h-3 w-2/3 rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Radio button skeleton */}
          <div className="absolute right-4 top-4">
            <div className="size-5 rounded-full bg-gray-200"></div>
          </div>
        </div>
      ))}
    </>
  );
}
