import { MapPin, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/layout/page-header";
import { ROLES } from "@/lib/schemas/auth";
import { requireRole } from "@/lib/server/auth";

// Farm illustration component (same as farm owner)

export default async function AgentDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const _user = await requireRole(ROLES.AGENT, {
    unauthorizedRedirect: `/${locale}/unauthorized`,
  });
  const _t = await getTranslations("dashboard");

  // Mock data - replace with actual data from API
  const metrics = {
    totalFarmers: 0,
    activeAcreage: 0,
    farmLands: {
      notStarted: 0,
      active: 0,
      deactivated: 0,
    },
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <PageHeader
        title="Dashboard"
        description="Manage your farmers and track their progress"
      />

      {/* Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="All farmers"
          value={metrics.totalFarmers}
          icon={Users}
          href={`/${locale}/agent/farmers`}
        />

        <MetricCard
          title="Active acreage"
          value={`${metrics.activeAcreage} acres`}
        />

        <MetricCard
          title="Farm lands"
          value={Object.values(metrics.farmLands).reduce((a, b) => a + b, 0)}
          icon={MapPin}
          href={`/${locale}/agent/farm-lands`}
          subMetrics={[
            {
              label: "Not started",
              value: metrics.farmLands.notStarted,
              status: "neutral",
            },
            {
              label: "Active",
              value: metrics.farmLands.active,
              status: "success",
            },
            {
              label: "Deactivated",
              value: metrics.farmLands.deactivated,
              status: "error",
            },
          ]}
        />
      </div>

      {/* Empty State Section */}
      {metrics.totalFarmers === 0 && (
        <div className="bg-card rounded-lg border">
          <EmptyState />
        </div>
      )}
    </div>
  );
}
