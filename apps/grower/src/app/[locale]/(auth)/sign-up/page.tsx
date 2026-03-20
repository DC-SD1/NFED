import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { SignUpForm } from "@/components/forms/sign-up-form";
import { Logo } from "@/components/logo";
import { ROLE_ROUTING_CONFIG } from "@/lib/config/auth";
import { ROLES, type ValidRole } from "@/lib/schemas/auth";
import { determinePrimaryRole } from "@/lib/schemas/auth";
import { getServerAuth } from "@/lib/server/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: t("signUpTitle"),
    description: t("signUpDescription"),
  };
}

export default async function SignUpPage() {
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
    redirect(dashboardPath);
  }

  // User is not authenticated, show sign-up form
  const t = await getTranslations("common");

  return (
    <div className="mx-auto w-full max-w-sm md:max-w-lg lg:max-w-2xl">
      <Logo />
      <div className="mb-12 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("signUp")}</h1>
      </div>

      <SignUpForm />
    </div>
  );
}
