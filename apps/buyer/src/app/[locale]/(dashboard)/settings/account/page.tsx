import { getTranslations } from "next-intl/server";

import { PageTitle } from "@/components/shared/page-title";
import type { Locale } from "@/config/i18n-config";

interface AccountSettingsPageParams {
  locale: Locale;
}

export default async function AccountSettingsPage({
  params,
}: {
  params: Promise<AccountSettingsPageParams>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings.account" });

  return (
    <section className="mt-10 space-y-6">
      <PageTitle title={t("title")} subtitle={t("subtitle")} />
      <div className="rounded-2xl border border-[hsl(var(--border-light))] bg-white p-6">
        <p className="text-muted-foreground text-sm">{t("empty")}</p>
      </div>
    </section>
  );
}
