import { Card, CardContent } from "@cf/ui";
import { Minimize2 } from "lucide-react";

// Base skeleton block
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

// Wrapper for each card with optional header
const SkeletonCard = ({
  children,
  className = "",
  showHeader = true,
}: {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}) => (
  <Card className={`w-full ${className}`}>
    {showHeader && (
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    )}
    <CardContent className="pt-0">{children}</CardContent>
  </Card>
);

// Create cards using one-liner reusable helpers
const SimpleInfoCard = (w1 = "w-16", w2 = "w-24") => (
  <SkeletonCard>
    <div className="space-y-2">
      <Skeleton className={`h-3 ${w1}`} />
      <Skeleton className={`h-5 ${w2}`} />
    </div>
  </SkeletonCard>
);

const GridInfoCard = () => (
  <SkeletonCard>
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div className="space-y-1" key={i}>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  </SkeletonCard>
);

const RecommendationsCard = () => (
  <SkeletonCard>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </SkeletonCard>
);

const SoilProfileCard = () => (
  <SkeletonCard>
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-full" />
    </div>
  </SkeletonCard>
);

// Map with floating controls
const MapSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <Skeleton className="size-full" />
    <div className="absolute left-4 top-4">
      <Skeleton className="h-8 w-20" />
    </div>
    <div className="absolute bottom-4 right-4 space-y-2">
      <Skeleton className="size-8" />
      <Skeleton className="size-8" />
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="rounded bg-black/80 px-3 py-1">
        <Skeleton className="h-4 w-8 bg-gray-400" />
      </div>
    </div>
  </div>
);

// Main Form Skeleton (mobile/tablet/desktop shared content)
const FarmLandMainFormSkeleton = () => (
  <>
    <div className="space-y-2 p-4">
      <div className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
        {SimpleInfoCard("w-16", "w-24")}
        {SimpleInfoCard("w-20", "w-28")}
      </div>
      {GridInfoCard()}
      {SimpleInfoCard("w-10", "w-24")}
      {SimpleInfoCard("w-24", "w-32")}
      {RecommendationsCard()}
      {SoilProfileCard()}
      <div className="mt-6">
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  </>
);

// Main Component: Responsive layout
export const FarmLandDetailsPageSkeleton = () => (
  <>
    {/* Mobile Layout */}
    <div className="min-h-screen w-full md:hidden">
      <div className="relative h-[50vh] w-full">
        <MapSkeleton className="h-full" />
      </div>
      <FarmLandMainFormSkeleton />
    </div>

    {/* Tablet Layout */}
    <div className="relative hidden h-screen w-full overflow-hidden md:block xl:hidden">
      <div className="absolute inset-0 z-0 px-3">
        <MapSkeleton className="h-full" />
      </div>
      <div className="absolute inset-x-6 bottom-6 z-10 h-[40vh] overflow-hidden rounded-lg bg-white shadow-2xl backdrop-blur-sm">
        <div className="h-full px-4 pt-2">
          <div className="flex items-center justify-between border-b p-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-2 xl:hidden">
              <Minimize2 className="size-6 text-gray-300" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <FarmLandMainFormSkeleton />
        </div>
      </div>
    </div>

    {/* Desktop Layout */}
    <div className="relative hidden h-[calc(100vh-200px)] w-full xl:block">
      <div className="absolute inset-0 z-0 px-3">
        <MapSkeleton className="h-full" />
      </div>
      <div className="absolute left-6 top-3 z-10 h-[84vh] w-2/5 max-w-[1100px] overflow-hidden">
        <Card className="flex h-full flex-col border-none bg-white shadow-md">
          <div className="flex items-center justify-between border-b p-4">
            <Skeleton className="h-6 w-32" />
          </div>
          <CardContent className="flex-1 overflow-y-auto p-4">
            <FarmLandMainFormSkeleton />
          </CardContent>
        </Card>
      </div>
    </div>
  </>
);

export default FarmLandDetailsPageSkeleton;
