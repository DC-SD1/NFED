import { ROLES } from "@/lib/schemas/auth";
import { requireRole } from "@/lib/server/auth";

import TermsAndConditionsClient from "./terms-and-conditions.client";

export default async function TermsAndConditionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Use existing RoleGuard pattern like other dashboards
  const _user = await requireRole(ROLES.FARM_OWNER, {
    unauthorizedRedirect: `/${locale}/unauthorized`,
  });

  return <TermsAndConditionsClient />;
}
