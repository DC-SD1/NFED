"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { useSignUpStore } from "@/lib/stores/sign-up-store";

interface OnboardingContextType {
  userSegment: "newbie" | "experienced" | null;
  basicInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { userSegment, basicInfo } = useSignUpStore();

  // Provide default values for missing fields
  const completeBasicInfo = {
    firstName: basicInfo.firstName || "",
    lastName: basicInfo.lastName || "",
    email: basicInfo.email || "",
    phone: "",
  };

  return (
    <OnboardingContext.Provider
      value={{ userSegment, basicInfo: completeBasicInfo }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
