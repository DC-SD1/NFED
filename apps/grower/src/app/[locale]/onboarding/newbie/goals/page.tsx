import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { GoalsForm } from "./goals-form";

export const metadata: Metadata = {
  title: "Your Goals - CF Grower",
  description: "What do you want to achieve with farming?",
};

export default function GoalsPage() {
  const t = useTranslations("onboarding.newbie.goals");

  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={6} totalSteps={7} />
      <div className="block space-y-0 lg:hidden">
        <Logo />
      </div>
      <div className="space-y-0 text-start lg:space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      <GoalsForm />
    </div>
  );
}
