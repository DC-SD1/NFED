"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useCallback } from "react";

export type AuthMode = "signup" | "reset" | "verify";

interface SystemReadinessError extends Error {
  code: string;
}

/**
 * Custom hook to check authentication system readiness based on mode
 * @param mode - Authentication mode (signup, reset, or verify)
 * @returns Object containing readiness state and check function
 */
export function useSystemReadiness(mode: AuthMode) {
  const { isLoaded: isSignUpLoaded, signUp, setActive: signUpSetActive } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn, setActive: signInSetActive } = useSignIn();

  // Determine which system to check based on mode
  const isLoaded = mode === "signup" ? isSignUpLoaded : isSignInLoaded;
  const authInstance = mode === "signup" ? signUp : signIn;
  const setActive = mode === "signup" ? signUpSetActive : signInSetActive;

  const checkReadiness = useCallback(() => {
    if (!isLoaded) {
      const error = new Error("System is not ready. Please try again.") as SystemReadinessError;
      error.code = "SYSTEM_NOT_READY";
      throw error;
    }

    if (!authInstance) {
      const modeText = mode === "signup" ? "Sign up" : mode === "reset" ? "Password reset" : "Login verification";
      const error = new Error(`${modeText} system is not ready. Please try again.`) as SystemReadinessError;
      error.code = `${mode.toUpperCase()}_NOT_READY`;
      throw error;
    }

    // For modes that need setActive (signup and verify)
    if ((mode === "signup" || mode === "verify") && !setActive) {
      const error = new Error("Session management is not ready. Please try again.") as SystemReadinessError;
      error.code = "SESSION_NOT_READY";
      throw error;
    }

    return true;
  }, [isLoaded, authInstance, mode, setActive]);

  return {
    isReady: Boolean(isLoaded && authInstance && (mode === "reset" || setActive)),
    isLoaded,
    authInstance,
    setActive,
    checkReadiness,
  };
}