import { Card, CardContent } from "@cf/ui/components/card";

interface StatsSkeletonProps {
  count?: number;
}

const StatsSkeleton = ({ count = 4 }: StatsSkeletonProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="animate-pulse rounded-2xl border-none bg-white shadow-md"
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="bg-gray-light flex size-10 shrink-0 items-center justify-center rounded-full">
                <div className="bg-gray-light size-5 rounded" />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="bg-gray-light h-3 w-16 rounded sm:h-3.5 sm:w-20" />
                <div className="bg-gray-light h-5 w-6 rounded sm:h-6 sm:w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsSkeleton;
