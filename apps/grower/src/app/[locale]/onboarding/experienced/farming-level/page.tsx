import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { FarmDetailsForm } from "./farming-level-form";

export const metadata: Metadata = {
  title: "Farm Details - CF Grower",
  description: "Tell us about your current farming operations",
};

export default function FarmDetailsPage() {
  const t = useTranslations("onboarding.experienced");

  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={3} totalSteps={10} />
      <div className="block lg:hidden">
        <Logo />
      </div>

      <div className="space-y-2 text-start">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("farming-level.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("farming-level.subtitle")}
        </p>
      </div>

      <FarmDetailsForm />
    </div>
  );
}
