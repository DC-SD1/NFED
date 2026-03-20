import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@cf/ui/components/card";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import AuthFormContent from "@/components/auth/auth-form-content";
import { AuthenticatedRedirect } from "@/components/auth/authenticated-redirect";
import { getUserMetadata } from "@/lib/server/cookies";
import { ImageAssets } from "@/utils/image-assets";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.metadata");

  return {
    title: t("signInTitle"),
    description: t("signInDescription"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations("auth");
  const { locale } = await params;

  // Try to get auth status using currentUser which is safer for public pages
  const user = await currentUser();

  // If user is authenticated, render client component that handles redirect
  // after auth state is fully initialized
  if (user) {
    const userMetadata = await getUserMetadata();
    const roles = userMetadata?.roles || [];
    return <AuthenticatedRedirect locale={locale} roles={roles} />;
  }

  return (
    <div className="bg-background relative flex min-h-svh flex-col items-center px-4">
      {/* Brand top-center */}
      <div className="mt-10 flex items-center gap-3">
        <Image src={ImageAssets.LOGO} alt="logo" width={150} height={100} />
      </div>

      {/* Center card */}
      <main className="flex w-full flex-1 items-center justify-center">
        <Card className="w-full max-w-md rounded-xl border border-[##F3F6F3] p-12 shadow-[0px_2px_20px_rgba(22,29,20,0.12)]">
          <CardHeader className="!p-0 text-center">
            <CardTitle className="text-3xl font-semibold">
              {t("signIn")}
            </CardTitle>
            <p className="text-secondary-foreground mt-1">{t("signInTitle")}</p>
          </CardHeader>
          <CardContent className="!p-0">
            <div className="pt-8">
              <AuthFormContent />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom spacer on small screens */}
      <div className="mb-10 h-4" />
    </div>
  );
}
