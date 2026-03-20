import { useTranslations } from "next-intl";

import { AuthorizedRepresentativeForm } from "../../_components/onboarding/company-doc/authorized-representative-form";

export default function AuthorizedRepresentativePage() {
  const t = useTranslations() as any;

  return (
    <div className="w-full space-y-7 pt-0 lg:w-[472px] lg:pt-20">
      <div className="space-y-2">
        <h3 className="text-muted text-2xl font-bold md:text-3xl lg:text-4xl">
          {t("buyerOnboarding.authorizedRepresentative.title")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t("buyerOnboarding.authorizedRepresentative.subtitle")}
        </p>
      </div>

      <AuthorizedRepresentativeForm />
    </div>
  );
}
