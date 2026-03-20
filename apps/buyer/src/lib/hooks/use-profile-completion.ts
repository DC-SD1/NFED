"use client";

import { useMemo } from "react";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";

interface ProfileCompletionData {
  percentage: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for calculating profile completion percentage based on user profile data
 *
 * @returns Object containing completion percentage, loading state, and error
 */
export function useProfileCompletion(): ProfileCompletionData {
  const api = useApiClient();
  const authUser = useAuthUser();

  // Fetch user profile data
  const {
    data: userProfile,
    isPending: isProfileLoading,
    error: profileError,
  } = api.useQuery("get", "/users/get-by-id", {
    enabled: !!authUser?.userId,
  });

  // Calculate completion percentage based on profile fields
  const percentage = useMemo(() => {
    if (!userProfile || isProfileLoading) return 0;

    const profile = userProfile as Record<string, unknown>;
    let completedFields = 0;
    let totalFields = 0;

    // Helper function to check if a field has a value
    const hasValue = (value: unknown): boolean => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (typeof value === "object" && "value" in value) {
        // Handle ValueObject pattern (e.g., Email, PhoneNumber)
        const valueObj = value as { value?: unknown };
        return hasValue(valueObj.value);
      }
      return true;
    };

    // Personal details fields (matching API schema)
    const personalFields = [
      { key: "firstName", required: true },
      { key: "lastName", required: true },
      { key: "email", required: true },
      { key: "phoneNumber", required: false }, // Optional
      { key: "country", required: false }, // Optional
      { key: "imageUrl", required: false }, // Optional, profile picture
    ];

    personalFields.forEach((field) => {
      totalFields++;
      const value = profile[field.key];
      if (hasValue(value)) {
        completedFields++;
      }
    });

    // Organization information (check if organisation exists and has fields)
    const organisation = profile.organisation as
      | Record<string, unknown>
      | null
      | undefined;
    if (organisation) {
      const organizationFields = [
        { key: "name", required: true }, // organizationName might be in organisation.name
        { key: "size", required: false },
        { key: "revenueRange", required: false },
        { key: "industry", required: false },
        { key: "website", required: false },
        { key: "yearEstablished", required: false },
      ];

      organizationFields.forEach((field) => {
        totalFields++;
        const value = organisation[field.key];
        if (hasValue(value)) {
          completedFields++;
        }
      });
    } else {
      // If no organisation object, still count the fields as incomplete
      totalFields += 6;
    }

    // Crop interests - may need to fetch from onboarding responses separately
    // For now, we'll skip this or check if there's a cropInterests field
    totalFields++;
    const cropInterests = profile.cropInterests as unknown[] | undefined;
    if (Array.isArray(cropInterests) && cropInterests.length > 0) {
      completedFields++;
    }

    // Calculate percentage (round to nearest integer, ensure it's between 0-100)
    if (totalFields === 0) return 0;
    const calculatedPercentage = Math.round(
      (completedFields / totalFields) * 100,
    );
    return Math.max(0, Math.min(100, calculatedPercentage));
  }, [userProfile, isProfileLoading]);

  return {
    percentage,
    isLoading: isProfileLoading,
    error: profileError as Error | null,
  };
}
