// app/(your-path)/marketing/page.tsx
import type { Metadata } from "next";
import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { MarketingForm } from "./marketing-form";

export const metadata: Metadata = {
  title: "How did you hear about us? - CF Grower",
  description: "Help us understand how you discovered Complete Farmer",
};

export default function MarketingPage() {
  const t = useTranslations("onboarding.marketing");

  return (
    <div className="flex max-h-screen overflow-hidden px-4 lg:fixed lg:inset-0">
      <div className="w-full max-w-md space-y-6 lg:fixed lg:left-3/4 lg:top-1/2 lg:w-auto lg:max-w-lg lg:-translate-x-1/2 lg:-translate-y-1/2">
        <ProgressIndicator currentStep={1} totalSteps={7} />
        <div className="block lg:hidden">
          <Logo />
        </div>
        <div className="space-y-2 text-start">
          <h1 className="text-2xl font-bold tracking-tight">{t("start")}</h1>
          <p className="text-md mt-10 tracking-tight">{t("title")}</p>
        </div>

        <MarketingForm />
      </div>
    </div>
  );
}
