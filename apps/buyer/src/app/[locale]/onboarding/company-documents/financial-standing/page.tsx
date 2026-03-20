import { useTranslations } from "next-intl";

import { FinancialStandingForm } from "../../_components/onboarding/company-doc/financial-standing-form";

export default function FinancialStandingPage() {
  const t = useTranslations() as any;

  return (
    <div className="w-full space-y-7 pt-0 lg:w-[472px] lg:pt-20">
      <div className="space-y-2">
        <h3 className="text-muted text-2xl font-bold md:text-3xl lg:text-4xl">
          {t("buyerOnboarding.financialStanding.title")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t("buyerOnboarding.financialStanding.subtitle")}
        </p>
      </div>

      <FinancialStandingForm />
    </div>
  );
}
