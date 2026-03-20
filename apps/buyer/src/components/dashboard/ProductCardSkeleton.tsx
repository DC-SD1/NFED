import { Skeleton } from "@cf/ui";

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div
      className={`h-[471px] overflow-hidden rounded-xl border border-[#f4f4f4] shadow-md ${className || ""}`}
    >
      {/* Image skeleton */}
      <div className="h-[207px] bg-[#f4f4f4]">
        <div className="relative size-full">
          <Skeleton className="size-full bg-[#f4f4f4]" />
          {/* Quantity badge skeleton */}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-[#f4f4f4] p-2">
            <Skeleton className="h-4 w-4 bg-[#f5f5f5]" />
            <Skeleton className="h-4 w-16 bg-[#f5f5f5]" />
            <Skeleton className="h-4 w-20 bg-[#f5f5f5]" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="h-[248px] space-y-6 p-4">
        {/* Title and category skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4 bg-[#f4f4f4]" />
          <Skeleton className="h-4 w-1/2 bg-[#f4f4f4]" />
        </div>

        {/* Details skeleton */}
        <div className="flex flex-col gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <Skeleton className="h-4 w-16 bg-[#f4f4f4]" />
              <Skeleton className="h-4 w-20 bg-[#f4f4f4]" />
            </div>
          ))}
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-[36px] w-full rounded-xl bg-[#f4f4f4]" />
      </div>
    </div>
  );
}
