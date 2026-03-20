import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { CommitmentExperiencedContent } from "./commitment-content";

export const metadata: Metadata = {
  title: "Your Goals - CF Grower",
  description: "What do you want to achieve with farming?",
};

export default function CommitmentExperiencedPage() {
  const t = useTranslations("onboarding.newbie.commitment");

  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={10} totalSteps={10} />
      <div className="block lg:hidden">
        <Logo />
      </div>
      <div className="space-y-2 text-start">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-md text-center">
          {t("description")}
        </p>
      </div>
      <CommitmentExperiencedContent />
    </div>
  );
}
