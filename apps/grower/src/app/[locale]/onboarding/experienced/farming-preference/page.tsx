import { useTranslations } from "next-intl";

import { ProgressIndicator } from "@/components/auth/progress-indicator";
import { Logo } from "@/components/logo";

import { FarmingPreferenceForm } from "./farming-preference-form";

export default function FarmingPreferencePage() {
  const t = useTranslations("onboarding.experienced.preference");
  return (
    <div className="space-y-0 lg:space-y-6">
      <ProgressIndicator currentStep={5} totalSteps={10} />
      <div className="block lg:hidden">
        <Logo />
      </div>
      <div className="space-y-2 text-start">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      <FarmingPreferenceForm />
    </div>
  );
}
