"use client";

import { Button } from "@cf/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import ActivitySummaryCard from "@/components/dashboard/farm-manager-cards/activity-summary-card";
import AddressDetailsCard from "@/components/dashboard/farm-manager-cards/address-details-card";
import AssignedFarmLands from "@/components/dashboard/farm-manager-cards/assigned-farm-card";
import PersonalDetailsCard from "@/components/dashboard/farm-manager-cards/personal-details-card";
import UserProfileCard from "@/components/dashboard/farm-manager-cards/user-profile-card";
import ManagerDetailsSkeleton from "@/components/dashboard/skeletons/manager-detail-skeleton";
import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast } from "@/lib/utils/toast";

interface Props {
  id: string;
}

export default function ManagerDetailsClient({ id }: Props) {
  const api = useApiClient();
  const { userId: authUserId } = useAuthUser();
  const { onOpen } = useModal();
  const queryClient = useQueryClient();
  const tErrors = useTranslations("auth.errors");
  const deactivateContractMutation = api.useMutation(
    "post",
    "/farm-management/contracts/deactivate",
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/users/farm-manager",
            {
              params: {
                query: { FarmManagerId: id, FarmOwnerId: authUserId },
              },
            },
          ],
        });

        onOpen("Success", {
          successTitle: "Farm manager deactivated!",
          successDescription: `${actualManager?.firstName ?? ""} ${actualManager?.lastName ?? ""} has been successfully deactivated.`,
        });
      },
      onError: () => {
        showErrorToast(tErrors("failedToDeactivateManager"));
      },
    },
  );

  const {
    data: farmManager,
    isLoading,
    refetch,
  } = api.useQuery(
    "get",
    "/users/farm-manager",
    {
      params: {
        query: { FarmManagerId: id, FarmOwnerId: authUserId! },
      },
    },
    {
      enabled: !!id && !!authUserId,
    },
  );

  if (isLoading) {
    return <ManagerDetailsSkeleton />;
  }

  const actualManager = farmManager?.farmManagerDetails?.farmManager;
  const contractData = farmManager?.farmManagerDetails?.contract;

  const handleDeactivateClick = () => {
    if (contractData?.contractStatus === "Terminated") {
      showErrorToast(tErrors("farmManagerDeactivated"));
      return;
    }
    const farmManagerName =
      `${actualManager?.firstName ?? ""} ${actualManager?.lastName ?? ""}`.trim();

    onOpen("Error", {
      errorTitle: "Deactivate farm manager",
      errorSubtitle: (
        <>
          You are about to deactivate farm manager{" "}
          <strong>{farmManagerName}</strong>.
        </>
      ),
      errorDescription: "Are you sure you want to continue?",
      primaryButton: {
        label: "Continue and deactivate ›",
        onClick: () => {
          if (!contractData?.id) return;

          deactivateContractMutation.mutate({
            body: {
              contractId: contractData.id,
            },
          });
        },
        variant: "default",
      },
      secondaryButton: {
        label: "Cancel",
        onClick: () => {
          return;
        },
        variant: "link",
      },
    });
  };

  return (
    <TopLeftHeaderLayout>
      <div className="mb-16 w-full space-y-6  py-6 xl:mb-0 xl:px-4">
        <UserProfileCard
          name={`${actualManager?.firstName ?? ""} ${actualManager?.lastName ?? ""}`}
          status={contractData?.contractStatus ?? ""}
          yearsOfExperience={actualManager?.experienceYears ?? 0}
          assignedGrower={0}
        />
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="flex flex-col gap-6 xl:w-2/5">
            <PersonalDetailsCard
              firstName={actualManager?.firstName ?? ""}
              lastName={actualManager?.lastName ?? ""}
              dateOfBirth={actualManager?.dateOfBirth ?? ""}
              idNumber={actualManager?.idNumber ?? ""}
              gender={actualManager?.gender ?? ""}
              yearsOfExperience={actualManager?.experienceYears ?? 0}
              email={actualManager?.emailAddress ?? ""}
              contactNumber={actualManager?.phoneNumber ?? ""}
              userId={actualManager?.id ?? ""}
              onSuccess={() => refetch()}
            />
            <AddressDetailsCard
              village={actualManager?.village ?? ""}
              region={actualManager?.region ?? ""}
              country={actualManager?.country ?? ""}
              userId={actualManager?.id ?? ""}
              onSave={() => refetch()}
            />

            {/* Show only on xl and above */}
            <div className="hidden w-full justify-center xl:flex">
              <Button
                variant="unstyled"
                className="font-semibold"
                onClick={handleDeactivateClick}
              >
                Deactivate farm manager
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-6 xl:w-3/5 xl:self-start">
            <AssignedFarmLands
              fullName={
                actualManager
                  ? `${actualManager.firstName} ${actualManager.lastName}`
                  : ""
              }
              managerId={actualManager?.id ?? ""}
            />
            <ActivitySummaryCard />
          </div>
        </div>

        {/* Show only on mobile and tablet */}
        <div className="block xl:hidden">
          <Button
            variant="unstyled"
            className="w-full font-semibold"
            onClick={handleDeactivateClick}
          >
            Deactivate farm manager
          </Button>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
