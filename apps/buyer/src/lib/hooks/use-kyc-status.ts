"use client";

import { useEffect } from "react";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";

/**
 * Custom hook for managing KYC status data and operations
 * 
 * @returns Object containing KYC status data, loading states, and helper functions
 */
export function useKycStatus() {
  const api = useApiClient();
  const authUser = useAuthUser();
  const setHasSubmitted = useOnboardingStore((s) => s.setHasSubmitted);
  const setHasDraft = useOnboardingStore((s) => s.setHasDraft);
  const hasSubmitted = useOnboardingStore((s) => s.hasSubmitted);
  const hasDraft = useOnboardingStore((s) => s.hasDraft);

  // Fetch KYC status
  const { data: kycStatus, isPending: isKycStatusPending, error: kycStatusError } = api.useQuery("get", "/kyc/get-status", {
    params: {
      query: {
        UserId: authUser?.userId ?? "",
      },
    },
  }, {
    enabled: !!authUser?.userId,
    refetchInterval: 60_000,         // poll every 1 min
    refetchOnWindowFocus: true,      // refetch when tab regains focus
    staleTime: 60_000,               // consider fresh for 1 min
  });

  // Get the actual status from the API response
  const getApiStatus = () => {
    return kycStatus?.value?.kycStatus || (kycStatus as any)?.status;
  };

  // Get KYC ID from the API response
  const getKycId = () => {
    return (kycStatus as any)?.id;
  };

  // Check if KYC is in a specific status
  const isStatus = (status: string) => {
    return getApiStatus() === status;
  };

  // Check if KYC is accepted (should hide banner)
  const isAccepted = () => {
    return isStatus("Accepted");
  };

  // Check if KYC is in draft status
  const isDraft = () => {
    return isStatus("Draft");
  };

  // Check if KYC is submitted
  const isSubmitted = () => {
    return isStatus("Submitted");
  };

  // Check if KYC needs resubmission
  const needsResubmission = () => {
    const status = getApiStatus();
    return status === "ReSubmit" || status === "Resubmit";
  };

  useEffect(() => {
    if (isKycStatusPending) return;
    const apiStatus = getApiStatus();
    if (apiStatus === "Submitted" && !hasSubmitted) {
      setHasSubmitted(true);
    } else if (apiStatus !== "Submitted" && hasSubmitted) {
      setHasSubmitted(false);
    }
    if (apiStatus === "Draft" && !hasDraft) {
      setHasDraft(true);
    } else if (apiStatus !== "Draft" && hasDraft) {
      setHasDraft(false);
    }
  }, [getApiStatus(), isKycStatusPending]);

  return {
    // Data
    kycStatus,
    kycId: getKycId(),
    apiStatus: getApiStatus(),

    // Loading states
    isPending: isKycStatusPending,
    error: kycStatusError,

    // Helper functions
    isStatus,
    isAccepted,
    isDraft,
    isSubmitted,
    needsResubmission,
  };
}
