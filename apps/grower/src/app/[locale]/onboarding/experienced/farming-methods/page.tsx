import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { FarmingMethodsForm } from "./farming-methods-form";

export const metadata: Metadata = {
  title: "Farming Methods - CF Grower",
  description: "What farming methods do you use?",
};

export default function FarmingMethodsPage() {
  const t = useTranslations("onboarding.experienced.farming-method");

  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={8} totalSteps={10} />
      <div className="block lg:hidden">
        <Logo />
      </div>
      <div className="space-y-2 text-start">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <FarmingMethodsForm />
    </div>
  );
}
