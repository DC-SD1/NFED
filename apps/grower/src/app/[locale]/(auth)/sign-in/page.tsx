import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/components/forms/login-form";
import { Logo } from "@/components/logo";
import { ROLE_ROUTING_CONFIG } from "@/lib/config/auth";
import { ROLES, type ValidRole } from "@/lib/schemas/auth";
import { determinePrimaryRole } from "@/lib/schemas/auth";
import { getServerAuth } from "@/lib/server/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("signInTitle"),
    description: t("signInDescription"),
  };
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Check if user is already authenticated
  const user = await getServerAuth();

  if (user) {
    // User is authenticated, redirect to their dashboard
    const primaryRole =
      user.roles && user.roles.length > 0
        ? determinePrimaryRole(user.roles as ValidRole[])
        : ROLES.FARM_OWNER;

    const dashboardPath =
      ROLE_ROUTING_CONFIG[primaryRole]?.dashboard || "/dashboard";
    redirect(`/${locale}${dashboardPath}`);
  }

  // User is not authenticated, show sign-in form
  const t = await getTranslations("common");

  return (
    <div className="mx-auto w-full max-w-sm md:max-w-lg lg:max-w-2xl">
      <Logo />
      <div className="mb-20 space-y-2 md:mb-12">
        <h1 className="text-2xl font-bold tracking-tight">{t("signIn")}</h1>
      </div>

      <LoginForm />
    </div>
  );
}
