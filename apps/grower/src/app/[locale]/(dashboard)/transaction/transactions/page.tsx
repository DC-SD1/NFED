import { Card, CardHeader, CardTitle } from "@cf/ui";

import { ROLES } from "@/lib/schemas/auth";
import { requireRole } from "@/lib/server/auth";

function TransactionsContent() {
  return (
    <div className="container mx-auto w-full space-y-6 py-6">
      <div className="flex flex-col gap-6">
        <Card className="rounded-2xl border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-semibold">
              Transactions
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Use existing RoleGuard pattern like other dashboards
  const _user = await requireRole(ROLES.FARM_OWNER, {
    unauthorizedRedirect: `/${locale}/unauthorized`,
  });

  return <TransactionsContent />;
}
