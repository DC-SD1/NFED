import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { LandAvailabilityForm } from "./land-availability-form";

export const metadata: Metadata = {
  title: "Why Farming? - CF Grower",
  description: "Tell us about your farming motivation",
};

export default function WhyFarmingPage() {
  const t = useTranslations("onboarding.experienced.land-availability");
  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={6} totalSteps={10} />
      <div className="block lg:hidden">
        <Logo />
      </div>
      <div className="space-y-8 text-start">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-md mt-16">{t("greatChoice")}</p>
      </div>

      <LandAvailabilityForm />
    </div>
  );
}
