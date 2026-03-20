// File: src/app/[locale]/profile/ProfilePageClient.tsx
"use client";

import { Button } from "@cf/ui";

import AddressDetailsCard from "@/components/dashboard/profile-cards/address-details-card";
import PersonalDetailsCard from "@/components/dashboard/profile-cards/personal-details-card";
import PreferencesCard from "@/components/dashboard/profile-cards/preferences-details-card";
import ProfileCard from "@/components/dashboard/profile-cards/user-profile-card";
import ManagerDetailsSkeleton from "@/components/dashboard/skeletons/manager-detail-skeleton";
import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { useApiClient } from "@/lib/api";

interface ProfilePageClientProps {
  locale: string;
  user: { userId: string };
}

export default function ProfilePageClient({ user }: ProfilePageClientProps) {
  const api = useApiClient();
  const id = user?.userId;

  const { data: farmOwner, isLoading } = api.useQuery(
    "get",
    "/users/get-by-id",
  );
  const { data: preferencesResponse } = api.useQuery(
    "get",
    "/onboarding/{userId}/responses",
    {
      params: {
        path: {
          userId: id ?? "",
        },
      },
    },
  );

  const preferenceResponse = preferencesResponse?.responses;

  const preferencesData = {
    farmingExperience: preferenceResponse?.farmingExperience as
      | string
      | undefined,
    farmingLevel: (preferenceResponse?.data as any)?.farmingLevel as
      | string
      | undefined,
    farmingMethod: (preferenceResponse?.data as any)?.farmingMethod as
      | string
      | undefined,
    cropCultivated: (preferenceResponse?.data as any)?.cropCultivated as
      | string[]
      | undefined,
    accountStatus: "Partially Compliant" as const,
    userId: user.userId,
  };

  if (isLoading || !farmOwner) return <ManagerDetailsSkeleton />;

  return (
    <TopLeftHeaderLayout>
      <div className="container px-2">
        <div className="mb-2">
          <ProfileCard farmOwner={farmOwner} />
        </div>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <div className="space-y-2">
            <PersonalDetailsCard
              farmOwner={farmOwner}
              educationLevel={preferenceResponse?.educationLevel as string}
            />
            <AddressDetailsCard farmOwner={farmOwner} />
            {/* Show only on xl and above */}
            <div className="hidden w-full justify-center pt-8 xl:flex">
              <Button variant="unstyled" className="font-semibold" disabled>
                Delete my account
              </Button>
            </div>
          </div>
          <div>
            <PreferencesCard {...preferencesData} />
          </div>
        </div>
        {/* Show only on mobile and tablet */}
        <div className="mt-14 block xl:hidden">
          <Button variant="unstyled" className="w-full font-semibold" disabled>
            Delete my account
          </Button>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
