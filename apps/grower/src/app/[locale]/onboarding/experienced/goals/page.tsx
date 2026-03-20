import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { ExperiencedGoalsForm } from "./goals-form";

export const metadata: Metadata = {
  title: "Your Goals - CF Grower",
  description: "What do you want to achieve with CF Grower?",
};

export default function ExperiencedGoalsPage() {
  const t = useTranslations("onboarding.newbie.goals");

  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={9} totalSteps={10} />
      <div className="block lg:hidden">
        <Logo />
      </div>
      <div className="space-y-2 text-start">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      <ExperiencedGoalsForm />
    </div>
  );
}
