"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SegmentationForm as BaseSegmentationForm } from "@/components/forms/segmentation-form";
import type { SegmentationFormData } from "@/lib/schemas/sign-up";
import { useSignUpStore } from "@/lib/stores/sign-up-store";

export function SegmentationForm() {
  const router = useRouter();
  const { setUserSegment } = useSignUpStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: SegmentationFormData) => {
    setIsLoading(true);

    try {
      // Save user segment
      setUserSegment(data.userType);

      // TODO: Complete Clerk sign-up and sign in user
      // await completeClerkSignUp()
      // await signInWithClerk()

      // Navigate based on user type
      if (data.userType === "newbie") {
        router.push("/onboarding/newbie/welcome");
      } else {
        router.push("/onboarding/experienced/farming-level");
      }
    } catch (error) {
      console.error("Error completing sign-up:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <BaseSegmentationForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
