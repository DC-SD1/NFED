"use client";

import type { paths } from "@cf/api";
import { Avatar, AvatarFallback, Button, Card, CardContent } from "@cf/ui";

import { useApiClient } from "@/lib/api";
import { createAuthQueryOptions } from "@/lib/hooks/use-auth-query";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";

interface ProfileCardProps {
  farmOwner: paths["/users/get-by-id"]["get"]["responses"]["200"]["content"]["application/json"];
}

export default function ProfileCard({ farmOwner }: ProfileCardProps) {
  const api = useApiClient();
  const { userId: authUserId } = useAuthUser();

  const { data: landMetrics, isLoading: isLoadingLandMetrics } = api.useQuery(
    "post",
    "/farm-management/get-farm-metrics",
    {
      body: { farmOwnerId: authUserId || "" },
    },
    createAuthQueryOptions(authUserId),
  );

  const { data: managerMetrics, isLoading: isLoadingManagerMetrics } =
    api.useQuery(
      "get",
      "/users/farm-managers-metrics",
      {
        params: { query: { FarmOwnerId: authUserId || "" } },
      },
      createAuthQueryOptions(authUserId),
    );

  const { data: preferencesResponse } = api.useQuery(
    "get",
    "/onboarding/{userId}/responses",
    {
      params: {
        path: {
          userId: authUserId ?? "",
        },
      },
    },
  );

  const preferenceResponse = preferencesResponse?.responses;

  const preferencesData = {
    farmingExperience: preferenceResponse?.farmingExperience as
      | string
      | undefined,
    farmingLevel: preferenceResponse?.farmingLevel as string | undefined,
    farmingMethod: (preferenceResponse?.data as any)?.farmingMethod as
      | string
      | undefined,
    cropsCultivated: (preferenceResponse?.data as any)?.cropsCultivated as
      | string[]
      | undefined,
    accountStatus: "Partially Compliant" as const,
    userId: authUserId ?? "",
  };

  const getTotalFarmLands = (): number => {
    if (!landMetrics) return 0;
    return landMetrics.reduce(
      (total: number, item: any) => total + (item.count || 0),
      0,
    );
  };
  const totalFarmLands = getTotalFarmLands();
  const totalManagers = managerMetrics?.totalFarmManagers || 0;
  const firstName = farmOwner?.firstName || "";
  const lastName = farmOwner?.lastName || "";
  const name = (firstName + " " + lastName).trim() || "User";

  const avatarInitial = name.charAt(0).toUpperCase();

  const experienceStatus = preferencesData.farmingExperience;

  return (
    <Card className="w-full rounded-3xl border-none">
      <CardContent className="relative p-6">
        <div className="mt-4 flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <Avatar width="w-16" height="h-16">
                <AvatarFallback
                  width="w-16"
                  height="h-16"
                  className="bg-primary-darkest text-primary-lightest text-2xl font-bold"
                >
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="mb-2 text-lg font-semibold">{name}</h3>
                <p className="text-gray-dark text-sm">
                  Experience Status:{" "}
                  <span className="text-primary">{experienceStatus}</span>
                </p>
              </div>
            </div>

            <div className="hidden lg:flex">
              <Button variant="unstyled" className="text-primary p-0 text-sm">
                Add profile image
              </Button>
            </div>

            {/* Mobile & Tablet view: Smaller stats cards aligned left */}
            <div className="mt-4 lg:hidden">
              <div className="mb-3 flex flex-col gap-3">
                <div className="bg-userDropdown-background rounded-lg p-2 text-center">
                  <p className="text-gray-dark mb-1 text-sm">
                    Total farm lands
                  </p>
                  {isLoadingLandMetrics ? (
                    <div className="border-primary size-4 animate-spin rounded-full border-4 border-t-transparent"></div>
                  ) : (
                    <p className="text-2xl font-bold">{totalFarmLands}</p>
                  )}
                </div>
                <div className="bg-userDropdown-background rounded-lg p-2 text-center">
                  <p className="text-gray-dark mb-1 text-sm">
                    Total farm managers
                  </p>
                  <div className="flex items-center justify-center">
                    {isLoadingManagerMetrics ? (
                      <div className="border-primary size-4 animate-spin rounded-full border-4 border-t-transparent"></div>
                    ) : (
                      <p className="text-2xl font-bold">{totalManagers}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop view: Stats in top right */}
          <div className="absolute right-6 top-6 hidden gap-2 lg:flex">
            <div className="bg-userDropdown-background rounded-lg p-4 text-center">
              <p className="text-gray-dark mb-1 text-sm">Total farm managers</p>
              {isLoadingManagerMetrics ? (
                <div className="border-primary size-4 animate-spin rounded-full border-4 border-t-transparent"></div>
              ) : (
                <p className="text-2xl font-bold">{totalManagers}</p>
              )}
            </div>
            <div className="bg-userDropdown-background rounded-lg p-4 text-center">
              <p className="text-gray-dark mb-1 text-sm">Total farm lands</p>
              <div className="flex items-center justify-center">
                {isLoadingLandMetrics ? (
                  <div className="border-primary size-4 animate-spin rounded-full border-4 border-t-transparent"></div>
                ) : (
                  <p className="text-2xl font-bold">{totalFarmLands}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
