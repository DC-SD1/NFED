import { Button } from "@cf/ui";
import { ChevronRight } from "@cf/ui/icons";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { SignUpForm } from "@/components/forms/sign-up-form";
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
        : ROLES.BUYER;

    const dashboardPath =
      ROLE_ROUTING_CONFIG[primaryRole]?.dashboard || "/dashboard";
    redirect(dashboardPath);
  }

  // User is not authenticated, show sign-up form
  const t = await getTranslations("common");
  const tAuth = await getTranslations("auth");
  const locale = await getLocale();

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="mb-10 space-y-2 md:mb-12">
        <h1 className="text-2xl font-bold tracking-tight">{t("signUp")}</h1>
        <div className="flex w-full gap-3">
          <p className="text-sm text-gray-500">{tAuth("alreadyHaveAccount")}</p>
          <Button
            variant="link"
            className="h-auto p-0 text-sm text-[#4B908B] hover:text-[#4B908B]/90"
            asChild
          >
            <Link href={`/${locale}/sign-in`}>
              {tAuth("haveAccount")} <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <SignUpForm />
    </div>
  );
}
