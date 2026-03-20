import {Button} from "@cf/ui/components/button";
import {auth} from "@clerk/nextjs/server";
import Link from "next/link";
import {getTranslations} from "next-intl/server";

import {i18n} from "@/config/i18n-config";
import {getUserMetadata} from "@/lib/server/cookies";
import {getRoleBasedDestination} from "@/lib/utils/navigation";

async function redirectToDashboard(userId: string, locale: string) {
  const userMetadata = await getUserMetadata();
  const roles = userMetadata?.roles || [];
  return getRoleBasedDestination(roles, locale);
}

export default async function UnauthorizedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || i18n.defaultLocale;
  const t = await getTranslations({ locale, namespace: "common" });

  const { userId } = await auth();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-6xl">🚫</div>

        <h1 className="text-destructive text-3xl font-bold">
          {t("errors.unauthorized.title")}
        </h1>

        <p className="text-muted-foreground">
          {t("errors.unauthorized.message")}
        </p>

        <div className="space-y-4">
          {userId && (
            <Button asChild>
              <Link href={await redirectToDashboard(userId, locale)}>
                {t("errors.unauthorized.goToDashboard")}
              </Link>
            </Button>
          )}
          {!userId && (
            <div>
              <Button variant="outline" asChild>
                <Link href={`/${locale}`}>
                  {t("errors.unauthorized.goToHome")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
