import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@cf/ui";
import { IconUser, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { PageTitle } from "@/components/shared/page-title";
import type { Locale } from "@/config/i18n-config";

import { CropInterestsCard } from "./_components/crop-interests-card";
import { OrganizationInformationCard } from "./_components/organization-information-card";
import { PersonalDetailsCard } from "./_components/personal-details-card";
import { ProfileCompletionCard } from "./_components/profile-completion-card";
import { ProfileDocumentsOverview } from "./_components/profile-documents-overview";

interface ProfileSettingsPageParams {
  locale: Locale;
}

export default async function ProfileSettingsPage({
  params,
}: {
  params: Promise<ProfileSettingsPageParams>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings.profile" });

  return (
    <section className="mt-10 space-y-6">
      <div className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList className="text-base font-bold">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-primary">
                <Link href={`/${locale}/settings`}>{t("breadcrumb.settings")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                {t("breadcrumb.profileSettings")}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PageTitle title={t("title")} />
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="h-12 w-full justify-start rounded-none border-b border-[hsl(var(--border-light))] bg-transparent px-0">
          <TabsTrigger
            value="profile"
            className="flex h-12 items-center rounded-none data-[state=active]:border-x-0 data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--text-dark))] data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-[hsl(var(--text-dark))] data-[state=active]:shadow-none"
          >
            <IconUser className="mr-2 size-4" /> <span>{t("tabs.profileDetails")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="staff"
            className="flex h-12 items-center rounded-none data-[state=active]:border-x-0 data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--text-dark))] data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-[hsl(var(--text-dark))] data-[state=active]:shadow-none"
          >
            <IconUsers className="mr-2 size-4" /> <span>{t("tabs.staffDetails")}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full space-y-6 lg:w-[371px]">
              <PersonalDetailsCard />
              <ProfileCompletionCard />
            </div>
            <div className="flex-1 space-y-6">
              <OrganizationInformationCard />
              <CropInterestsCard />
              <ProfileDocumentsOverview />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="staff" className="mt-6">
          <div></div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
