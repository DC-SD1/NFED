"use client";

import { useParams } from "next/navigation";

import { mapKycDocuments } from "@/lib/kyc/document-mapper";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";

import { useApiClient } from "../api/client";

/**
 * Custom hook for managing KYC document data and operations
 * 
 * @param locale - The current locale for generating resubmit links
 * @param kycId - Optional KYC ID from query parameters (for resubmission forms)
 *                Pass undefined to use route params (for review pages),
 *                Pass null to explicitly disable API call,
 *                Pass a string to use that specific ID
 * @returns Object containing KYC document data, loading states, and helper functions
 */
export function useKycData(locale: string, kycId?: string | null) {
  const params = useParams<{ id: string }>();
  const { id: routeKycId } = params;
  const api = useApiClient();

  // Determine which ID to use:
  // - If kycId is explicitly null, don't make API call
  // - If kycId is a non-empty string, use it
  // - If kycId is undefined or empty string, fall back to route params
  const extractedId = kycId === null
    ? null
    : (kycId && kycId.trim() !== "")
      ? kycId
      : (routeKycId || null);

  // Fetch KYC data only if we have a valid KYC ID
  // Don't even set up the query if extractedId is null or empty
  const shouldFetchKyc = extractedId !== null && extractedId !== undefined && extractedId.trim() !== "";

  const { data: kycData, isPending, error } = api.useQuery("get", "/kyc/get-kyc", {
    params: {
      query: {
        KycId: extractedId || "",
      },
    },
    // Explicitly disable the query when we don't have a valid ID
    enabled: shouldFetchKyc,
    // Prevent refetching when the window regains focus
    refetchOnWindowFocus: false,
    // Prevent refetching on mount
    refetchOnMount: shouldFetchKyc,
  });

  const corporateIdentity = useOnboardingStore((state) => state.corporateIdentity);
  const authorizedRepresentative = useOnboardingStore((state) => state.authorizedRepresentative);
  const financialStanding = useOnboardingStore((state) => state.financialStanding);

  const mappedDocuments = mapKycDocuments({
    locale,
    kycId: extractedId,
    apiDocuments: kycData?.value?.documents ?? null,
    corporateIdentity,
    authorizedRepresentative,
    financialStanding,
    uploadingFields: undefined,
  });

  const getSectionStatus = (section: keyof typeof mappedDocuments): "approved" | "pending" | "rejected" => {
    const docs = mappedDocuments[section];
    if (docs.length === 0) return "pending";

    const hasDeclined = docs.some((doc) => doc.status === "rejected");
    const hasPending = docs.some((doc) => doc.status === "pending");
    const allAccepted = docs.every((doc) => doc.status === "approved");

    if (hasDeclined) return "pending";
    if (hasPending) return "pending";
    if (allAccepted) return "approved";

    return "pending";
  };

  return {
    kycData,
    documents: mappedDocuments,
    isPending,
    isPendingResubmit: false,
    error,
    getSectionStatus,
  };
}
