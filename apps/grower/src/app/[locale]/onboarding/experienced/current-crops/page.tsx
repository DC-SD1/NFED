import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { CurrentCropsForm } from "./current-crops-form";

export const metadata: Metadata = {
  title: "Current Crops - CF Grower",
  description: "What are you currently growing?",
};

export default function CurrentCropsPage() {
  const t = useTranslations("onboarding.experienced.current-crops");

  return (
    <div className="flex max-h-screen flex-col space-y-0 overflow-hidden lg:space-y-6">
      <ProgressIndicator currentStep={4} totalSteps={10} />

      <div className="mb-4 block lg:hidden">
        <Logo />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-md mt-2 font-bold">{t("subtitle")}</p>
      </div>

      <div className="flex-1">
        <CurrentCropsForm />
      </div>
    </div>
  );
}
