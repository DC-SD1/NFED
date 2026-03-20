import { getTranslations } from "next-intl/server";

import EmptyStateFarmManager from "@/components/dashboard/empty-state-farm-manager";
import NotificationsCard from "@/components/dashboard/notification-card";
import TasksCard from "@/components/dashboard/tasks-card";
import WelcomeCard from "@/components/dashboard/welcome-card";
import { ROLES } from "@/lib/schemas/auth";
import { requireRole } from "@/lib/server/auth";

function FarmManagerDashboardContent() {
  const _t = getTranslations("dashboard");

  return (
    <div className="container mx-auto w-full space-y-6 py-6">
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex flex-col gap-4 xl:w-3/4">
          <WelcomeCard showProgress={false} />
          <EmptyStateFarmManager />
        </div>

        <div className="flex w-full flex-col gap-4 xl:w-1/4">
          <div className="flex flex-col gap-4 xl:min-h-screen">
            <NotificationsCard />
            <TasksCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function FarmManagerDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Use existing RoleGuard pattern like other dashboards
  const _user = await requireRole(ROLES.FARM_MANAGER, {
    unauthorizedRedirect: `/${locale}/unauthorized`,
  });

  return <FarmManagerDashboardContent />;
}
