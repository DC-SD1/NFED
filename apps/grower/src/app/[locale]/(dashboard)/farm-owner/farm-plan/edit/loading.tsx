import { Skeleton } from "@cf/ui";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import ProductionPlanSkeleton from "@/components/forms/production-plan-skeleton";

export default function FarmPlanEditLoading() {
  return (
    <TopLeftHeaderLayout>
      <div className="flex min-h-screen flex-col items-center px-2 lg:px-4">
        <div className="w-full space-y-6 pt-4 md:pt-6 lg:pt-6">
          <div className="text-left">
            <Skeleton className="mb-2 h-9 w-64 md:h-10 lg:h-12" />
            <Skeleton className="mt-2 h-5 w-96" />
          </div>

          <ProductionPlanSkeleton isEditMode={true} />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
