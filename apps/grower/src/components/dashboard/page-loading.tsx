import { Card, CardContent, Skeleton } from "@cf/ui";
import { Loader2 } from "lucide-react";

export function PageLoading({ title }: { title?: string }) {
  return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-primary mx-auto size-8 animate-spin" />
        {title && <p className="text-muted-foreground mt-4">{title}</p>}
      </div>
    </div>
  );
}

export function FarmLandUploadLoading() {
  return (
    <div className="flex flex-col items-center justify-center px-1 py-2 md:px-4">
      <div className="w-full max-w-lg space-y-8 md:max-w-4xl lg:max-w-2xl">
        <div className="space-y-3 text-left md:text-center">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Card>
          <CardContent className="flex h-64 items-center justify-center p-6">
            <Loader2 className="text-primary size-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function FarmLandConfirmLoading() {
  return (
    <div className="flex flex-col items-center justify-center px-1 py-8">
      <div className="w-full max-w-lg space-y-8 md:max-w-4xl lg:max-w-2xl">
        <Skeleton className="h-[328px] w-full rounded-xl" />
        <Card className="mt-4 border-0 bg-white">
          <CardContent className="p-5">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-6 w-32" />
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function FarmLandDetailsLoading() {
  return (
    <div className="flex flex-col items-center justify-center px-1 py-2 md:px-4">
      <div className="w-full max-w-lg space-y-8 md:max-w-4xl lg:max-w-2xl">
        <div className="space-y-3 text-left md:text-center">
          <Skeleton className="h-9 w-3/4" />
        </div>
        <Card>
          <CardContent className="space-y-6 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function FarmLandSuccessLoading() {
  return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-primary mx-auto size-16 animate-spin" />
        <p className="text-muted-foreground mt-4">Loading success page...</p>
      </div>
    </div>
  );
}