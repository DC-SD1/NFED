import { Skeleton } from "@cf/ui";

interface LearningResourcesSkeletonProps {
  itemCount?: number;
  showVideos?: boolean;
  showDocuments?: boolean;
}

/**
 * Skeleton loader for video card item
 */
function VideoCardSkeleton() {
  return (
    <div className="bg-card-light-background flex w-full min-w-0 items-center gap-3 rounded-lg p-3">
      {/* Video thumbnail skeleton */}
      <Skeleton className="h-12 w-16 shrink-0 rounded-md sm:h-14 sm:w-20" />

      {/* Text content skeleton */}
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for document card item
 */
function DocumentCardSkeleton() {
  return (
    <div className="bg-card-light-background flex w-full min-w-0 items-center gap-3 rounded-lg p-3">
      {/* Document icon skeleton */}
      <Skeleton className="flex size-12 shrink-0 rounded-md sm:size-14" />

      {/* Text content skeleton */}
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>

      {/* Download button skeleton */}
      <Skeleton className="size-8 shrink-0 rounded-full sm:size-10" />
    </div>
  );
}

/**
 * Skeleton loader for learning resources section
 * Matches the exact layout and spacing of actual cards
 */
export default function LearningResourcesSkeleton({
  itemCount = 3,
  showVideos = true,
  showDocuments = true,
}: LearningResourcesSkeletonProps) {
  const videoCount = showVideos ? Math.ceil(itemCount / 2) : 0;
  const documentCount = showDocuments ? Math.floor(itemCount / 2) : 0;

  return (
    <div className="space-y-2">
      {/* Render video skeletons */}
      {showVideos &&
        Array.from({ length: videoCount }).map((_, index) => (
          <VideoCardSkeleton key={`video-skeleton-${index}`} />
        ))}

      {/* Render document skeletons */}
      {showDocuments &&
        Array.from({ length: documentCount }).map((_, index) => (
          <DocumentCardSkeleton key={`doc-skeleton-${index}`} />
        ))}
    </div>
  );
}

/**
 * Export individual skeletons for flexibility
 */
export { DocumentCardSkeleton, VideoCardSkeleton };
