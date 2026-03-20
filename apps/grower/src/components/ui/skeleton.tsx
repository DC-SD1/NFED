import { Skeleton as SkeletonComponent } from "@cf/ui";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <SkeletonComponent
      className={cn("bg-primary-light", className)}
      {...props}
    />
  );
}
