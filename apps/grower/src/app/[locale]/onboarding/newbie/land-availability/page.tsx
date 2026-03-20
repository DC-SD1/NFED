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
  const t = useTranslations("onboarding.newbie");

  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={4} totalSteps={7} />
      <div className="block space-y-0 lg:hidden">
        <Logo />
      </div>
      <div className="space-y-0 text-start lg:space-y-2">
        <div className="space-y-8 text-start">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("preference.title")}
          </h1>
          <p className="text-md mt-16">{t("land-availability.greatChoice")}</p>
        </div>

        <LandAvailabilityForm />
      </div>
    </div>
  );
}
