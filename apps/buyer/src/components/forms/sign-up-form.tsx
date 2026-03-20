"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BasicInfoForm } from "@/components/forms/basic-info-form";
import type { BasicInfoFormData } from "@/lib/schemas/sign-up";
import { useSignUpStore } from "@/lib/stores/sign-up-store";

import { AuthDivider } from "../auth/auth-divider";
import { GoogleOAuthButton } from "../auth/google-oauth-button";

export function SignUpForm() {
  const router = useRouter();
  const { setBasicInfo, setCurrentStep } = useSignUpStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: BasicInfoFormData) => {
    setIsLoading(true);

    // Save to store
    setBasicInfo(data);
    setCurrentStep(2);

    // Navigate to password page with signup mode
    router.push("/password?mode=signup");
  };

  return (
    <div className="space-y-6">
      <BasicInfoForm onSubmit={handleSubmit} isLoading={isLoading} />

      <div className="space-y-4">
        <AuthDivider />
        <GoogleOAuthButton />
      </div>
    </div>
  );
}
