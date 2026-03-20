import { redirect } from "next/navigation";

import { ROLE_ROUTING_CONFIG } from "@/lib/config/auth";
import { ROLES, type ValidRole } from "@/lib/schemas/auth";
import { determinePrimaryRole } from "@/lib/schemas/auth";
import { getServerAuth } from "@/lib/server/auth";

export default async function DashboardRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getServerAuth();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // Determine primary role and redirect
  const primaryRole =
    user.roles && user.roles.length > 0
      ? determinePrimaryRole(user.roles as ValidRole[])
      : ROLES.BUYER;

  const dashboardPath = ROLE_ROUTING_CONFIG[primaryRole]?.dashboard || "/home";

  redirect(`/${locale}${dashboardPath}`);
}
