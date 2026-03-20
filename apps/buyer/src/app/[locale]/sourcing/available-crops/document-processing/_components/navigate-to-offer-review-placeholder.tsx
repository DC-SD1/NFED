"use client";

import { useRouter } from "@bprogress/next/app";
import React from "react";

import { useSourcingStore } from "@/lib/stores/sourcing-store";

export default function NavigateToOfferReviewPlaceholder() {
  const router = useRouter();
  const { currentStep, steps, saveAndContinue } = useSourcingStore();

  const handleContinue = async () => {
    try {
      // Save current step data and continue
      const success = await saveAndContinue();

      if (success && currentStep < steps.length - 1) {
        const nextStep = steps[currentStep + 1];
        if (nextStep) {
          router.push(nextStep.href);
        }
      }
    } catch (error) {
      console.error("Error saving step data:", error);
      // Could show error toast here
    }
  };

  return <button onClick={handleContinue}>Continue</button>;
}
