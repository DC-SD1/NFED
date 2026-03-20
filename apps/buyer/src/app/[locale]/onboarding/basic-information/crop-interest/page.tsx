import { useTranslations } from "next-intl";

import { CropInterestForm } from "../../_components/onboarding/basic-info/crop-interest-form";

export default function CropInterestPage() {
  const t = useTranslations() as any;

  return (
    <div className="w-full space-y-7 pt-0 lg:w-[472px] lg:pt-20">
      <div className="space-y-2">
        <h3 className="text-muted text-2xl font-bold md:text-3xl lg:text-4xl">
          {t("buyerOnboarding.cropInterest.title")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t("buyerOnboarding.cropInterest.subtitle")}
        </p>
      </div>

      <CropInterestForm />
    </div>
  );
}
