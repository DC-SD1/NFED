import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { refreshTokenIfNeeded } from "@/lib/server/api-proxy-utils";
import { getUserMetadata } from "@/lib/server/cookies";
import { getRoleBasedDestination } from "@/lib/utils/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("landing");

  // Server-side auth check only via cookies to avoid Clerk SSR dependency here
  const userMetadata = await getUserMetadata();
  if (userMetadata) {
    try {
      await refreshTokenIfNeeded();
      // eslint-disable-next-line no-empty
    } catch {}
    const roles = userMetadata.roles || [];
    // Server-side redirect to avoid client-side loader stall
    const dest = getRoleBasedDestination(roles, locale);
    redirect(dest);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background container z-40">
        <div className="flex h-20 items-center justify-between py-6">
          <div className="flex gap-6 md:gap-10">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <span className="font-bold">Complete Farmer</span>
            </Link>
          </div>
          <nav className="flex gap-6">
            <Link
              href={`/${locale}/sign-in`}
              className="hover:text-accent-foreground inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors"
            >
              {t("hero.cta")}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              {t("hero.title")}
            </h1>
            <p className="text-muted-foreground max-w-[750px] text-lg sm:text-xl">
              {t("hero.subtitle")}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href={`/${locale}/sign-up`}
              className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-md border px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {t("hero.learnMore")}
            </Link>
          </div>
        </section>

        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
              {t("features.title")}
            </h2>
          </div>
          <div className="mx-auto mt-8 grid justify-center gap-4 sm:grid-cols-2 md:max-w-5xl md:grid-cols-3">
            <div className="bg-background relative overflow-hidden rounded-lg border p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">
                    {t("features.farmManagement.title")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("features.farmManagement.description")}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-background relative overflow-hidden rounded-lg border p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">
                    {t("features.cropTracking.title")}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t("features.cropTracking.description")}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-background relative overflow-hidden rounded-lg border p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">{t("features.analytics.title")}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t("features.analytics.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
