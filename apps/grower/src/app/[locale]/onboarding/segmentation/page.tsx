import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { SegmentationForm } from "./segmentation-form";

export const metadata: Metadata = {
  title: "Tell us about yourself - CF Grower",
  description: "Help us personalize your farming experience",
};

export default function SegmentationPage() {
  const t = useTranslations("onboarding.segmentation");

  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={2} totalSteps={7} />
      <div className="block lg:hidden">
        <Logo />
      </div>

      <div className="space-y-1 text-start">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <SegmentationForm />
    </div>
  );
}
