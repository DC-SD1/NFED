import { IconBell, IconUserCircle, IconUserCog } from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { PageTitle } from "@/components/shared/page-title";
import type { Locale } from "@/config/i18n-config";

import { SettingsCard } from "./_components/cards/settings-card";

interface SettingsPageParams {
  locale: Locale;
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<SettingsPageParams>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings" });

  const cards = [
    {
      title: t("cards.profile.title"),
      description: t("cards.profile.description"),
      href: "/settings/profile",
      icon: <IconUserCircle />,
    },
    {
      title: t("cards.notifications.title"),
      description: t("cards.notifications.description"),
      href: "/settings/notifications",
      icon: <IconBell />,
    },
    {
      title: t("cards.account.title"),
      description: t("cards.account.description"),
      href: "/settings/account",
      icon: <IconUserCog />,
    },
  ] satisfies {
    title: string;
    description: string;
    href: string;
    icon: ReactNode;
  }[];

  return (
    <div className="mt-10 space-y-6 lg:space-y-14">
      <PageTitle title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {cards.map((card) => (
          <SettingsCard key={card.href} locale={locale} {...card} />
        ))}
      </div>
    </div>
  );
}
