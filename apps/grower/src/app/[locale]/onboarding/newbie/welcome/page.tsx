import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { WelcomeContent } from "./welcome-content";

export const metadata: Metadata = {
  title: "Welcome to CF Grower",
  description: "Start your farming journey with Complete Farmer",
};

export default function WelcomePage() {
  const t = useTranslations("onboarding.newbie.preference");
  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={3} totalSteps={7} />
      <div className="block lg:hidden">
        <Logo />
      </div>
      <div className="space-y-2 text-start">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-md mt-9">{t("subtitle")}</p>
      </div>

      <WelcomeContent />
    </div>
  );
}
