import { useTranslations } from "next-intl";

import { OrganisationInfoForm } from "../../_components/onboarding/basic-info/organisation-info-form";

export default function OrganisationInformationPage() {
  const t = useTranslations("buyerOnboarding.basicInfo.organisationInfo");

  return (
    <div className="w-full space-y-7 pt-0 lg:w-[472px] lg:pt-20">
      <div className="space-y-2">
        <h3 className="text-muted text-2xl font-bold md:text-3xl lg:text-4xl">
          {t("title")}
        </h3>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <OrganisationInfoForm />
    </div>
  );
}
