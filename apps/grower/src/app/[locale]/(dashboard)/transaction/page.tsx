import { ROLES } from "@/lib/schemas/auth";
import { requireRole } from "@/lib/server/auth";

import TransactionOverviewClient from "./transaction-overview.client";

export default async function WalletOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Use existing RoleGuard pattern like other dashboards
  const _user = await requireRole(ROLES.FARM_OWNER, {
    unauthorizedRedirect: `/${locale}/unauthorized`,
  });

  return <TransactionOverviewClient />;
}
