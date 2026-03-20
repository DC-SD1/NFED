"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

import { updateClerkUserMetadata } from "@/lib/api/clerk-metadata";
import { registerUserOnBackend } from "@/lib/api/user-registration";
import { ERROR_CODES } from "@/lib/constants/auth";
import { ROLES } from "@/lib/schemas/auth";
import { useSignUpStore } from "@/lib/stores/sign-up-store";
import { logger } from "@/lib/utils/logger";

interface BackendRegistrationError extends Error {
  code?: string;
}

interface RegistrationResult {
  userId: string;
  success: boolean;
  metadataUpdated: boolean;
}

/**
 * Custom hook for handling backend user registration after Clerk authentication
 * Separates the backend registration logic from the authentication flow
 */
export function useBackendRegistration() {
  const { getToken, userId: currentUserId } = useAuth();
  const { setApiData, getRegistrationData } = useSignUpStore();

  const updateUserMetadata = useCallback(
    async (backendUserId: string, clerkUserId: string): Promise<boolean> => {
      try {
        const roles = [ROLES.FARM_OWNER]; // Default role for new users
        const metadataUpdated = await updateClerkUserMetadata(roles);

        if (!metadataUpdated) {
          logger.warn(
            "Failed to update Clerk metadata, but registration succeeded",
            {
              backendUserId,
              clerkUserId,
              roles,
            },
          );
          return false;
        }

        return true;
      } catch (metadataError) {
        logger.error("Error updating Clerk metadata", metadataError, {
          backendUserId,
          clerkUserId,
        });
        // Don't fail the registration if metadata update fails
        return false;
      }
    },
    [],
  );

  const register = useCallback(async (): Promise<RegistrationResult> => {
    const registrationData = getRegistrationData();

    if (!registrationData) {
      logger.error("Missing required data for backend registration", {
        debugInfo:
          "Check if basicInfo was properly set from sign-up form and clerkUserId is available",
        hasEmail: !!getRegistrationData()?.email,
        hasFirstName: !!getRegistrationData()?.firstName,
        hasLastName: !!getRegistrationData()?.lastName,
        hasAuthId: !!getRegistrationData()?.authId,
      });

      const error = new Error(
        "Registration data is incomplete. Please ensure all fields are filled and try again.",
      ) as BackendRegistrationError;
      error.code = ERROR_CODES.MISSING_REQUIRED_DATA;
      throw error;
    }

    // Update authId with current user ID if not already set correctly
    if (
      !registrationData.authId ||
      registrationData.authId.startsWith("sua_")
    ) {
      if (!currentUserId) {
        logger.error("No user ID available from Clerk session");
        throw new Error("User ID not available. Please try again.");
      }

      logger.info("Updating registration data with correct user ID", {
        oldAuthId: registrationData.authId,
        newAuthId: currentUserId,
      });

      // Update the store with the correct user ID
      setApiData({ clerkUserId: currentUserId });

      // Update the registration data object
      registrationData.authId = currentUserId;
    }

    // Get Clerk token for backend registration
    const clerkToken = await getToken();
    if (!clerkToken) {
      throw new Error("Failed to get Clerk authentication token");
    }

    try {
      // Register user on backend
      const { userId } = await registerUserOnBackend(
        registrationData,
        clerkToken,
      );

      // Store the backend userId
      setApiData({
        backendUserId: userId,
      });

      // Update Clerk metadata
      const metadataUpdated = await updateUserMetadata(
        userId,
        registrationData.authId,
      );

      return {
        userId,
        success: true,
        metadataUpdated,
      };
    } catch (registrationError) {
      logger.error("Backend user registration failed", registrationError, {
        clerkUserId: registrationData.authId,
      });

      const error = new Error(
        "Failed to complete registration. Please try again.",
      ) as BackendRegistrationError;
      error.code = "REGISTRATION_FAILED";
      throw error;
    }
  }, [
    getToken,
    currentUserId,
    getRegistrationData,
    setApiData,
    updateUserMetadata,
  ]);

  return {
    register,
  };
}
