"use client";

import SetupCardSkeleton from "./setup-card-skeleton";
import WelcomeCardSkeleton from "./welcome-card-skeleton";

export default function DashboardCardsSkeleton() {
  return (
    <>
      <WelcomeCardSkeleton />
      <SetupCardSkeleton />
    </>
  );
}
