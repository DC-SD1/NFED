/**
 * @name useClerkSignOut
 * @description Custom hook to handle Clerk sign-out functionality.
 * @returns {Function} signOutUser - Function to sign out the current user.
 */

import { useClerk } from "@clerk/nextjs";

import { logger } from "@/lib/utils/logger";

export const useClerkSignOut = () => {
  const { signOut } = useClerk();

  const signOutUser = async () => {
    try {
      await signOut();
    } catch (error) {
      logger.error("Clerk sign out error:", error);
    }
  };

  return { signOutUser };
};
