import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { FarmingMethodForm } from "./farming-method-form";

export const metadata: Metadata = {
  title: "Your Experience - CF Grower",
  description: "Tell us about your farming background",
};

export default function FarmingMethodPage() {
  const t = useTranslations("onboarding.newbie");
  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={5} totalSteps={7} />
      <div className="block space-y-0 lg:hidden">
        <Logo />
      </div>
      <div className="space-y-0 text-start lg:space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("preference.title2")}
        </h1>
      </div>

      <FarmingMethodForm />
    </div>
  );
}
