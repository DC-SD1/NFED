"use client";

import { Button } from "@cf/ui/components/button";
import { Card, CardContent } from "@cf/ui/components/card";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import CardHeader from "@/components/card-header";
import { PlanList } from "@/components/plan/plan-list";
import { useApiClient } from "@/lib/api/client";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";

import { SetupCard } from "./setup-card";
import DashboardCardsSkeleton from "./skeletons/dashboard-cards-skeleton";
import WelcomeCard from "./welcome-card.client";

interface DashboardCardsWrapperProps {
  // WelcomeCard props
  currentDate?: string;
  condition?: string;
  temperature?: number;
}

const DEFAULT_PROGRESS = {
  hasSignedUp: false,
  hasAddedFarmLand: false,
  hasInvitedFarmManager: false,
  hasAddedFarmPlan: false,
};

export function DashboardCardsWrapper({
  currentDate,
  condition,
  temperature,
}: DashboardCardsWrapperProps) {
  const router = useRouter();
  const api = useApiClient();
  const { userId } = useAuthUser();

  // Use React Query to fetch the progress data
  const { data, error, isLoading } = api.useQuery(
    "get",
    "/progress/farm-owner",
    {
      params: {
        query: {
          FarmOwnerId: userId || "",
        },
      },
      // Only fetch when userId is available
      enabled: !!userId,
    },
  );

  const progressData = data ?? DEFAULT_PROGRESS;

  if (error) {
    console.error("Failed to fetch progress data:", error);
  }

  const stepsComplete = useMemo(
    () =>
      [
        progressData.hasSignedUp,
        progressData.hasAddedFarmLand,
        progressData.hasInvitedFarmManager,
        progressData.hasAddedFarmPlan,
      ].filter(Boolean).length,
    [
      progressData.hasSignedUp,
      progressData.hasAddedFarmLand,
      progressData.hasInvitedFarmManager,
      progressData.hasAddedFarmPlan,
    ],
  );

  const allStepsComplete = useMemo(
    () =>
      !!progressData.hasSignedUp &&
      !!progressData.hasAddedFarmLand &&
      !!progressData.hasInvitedFarmManager &&
      !!progressData.hasAddedFarmPlan,
    [
      progressData.hasSignedUp,
      progressData.hasAddedFarmLand,
      progressData.hasInvitedFarmManager,
      progressData.hasAddedFarmPlan,
    ],
  );

  const handleCreatePlan = useCallback(() => {
    router.push("/farm-owner/farm-plan/select-land");
  }, [router]);
  // Show skeleton while loading
  if (isLoading || !userId) {
    return <DashboardCardsSkeleton />;
  }

  return (
    <>
      <WelcomeCard
        showProgress={!allStepsComplete}
        currentDate={currentDate}
        condition={condition}
        temperature={temperature}
        stepsComplete={stepsComplete}
      />

      {!allStepsComplete && (
        <SetupCard
          hasSignedUp={progressData.hasSignedUp ?? false}
          hasAddedFarmLand={progressData.hasAddedFarmLand ?? false}
          hasInvitedFarmManager={progressData.hasInvitedFarmManager ?? false}
          hasAddedFarmPlan={progressData.hasAddedFarmPlan ?? false}
        />
      )}
      {allStepsComplete && (
        <Card className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border-none shadow-lg">
          <CardContent className="md:p=6 min-w-0 max-w-full bg-[#FBFBFB] p-0 pt-4 md:px-2">
            <CardHeader
              containerClassName="mx-2"
              text={"Farm plan"}
              rightComponent={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 transition-all duration-200 hover:scale-105"
                  aria-label="Create farm plan"
                  onClick={handleCreatePlan}
                >
                  <MoreHorizontal size={20} className="text-foreground" />
                </Button>
              }
            />
            <div className="space-y-3">
              <PlanList
                containerClassName="lg:px-1"
                showFilterTabsLine={false}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
