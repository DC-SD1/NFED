import { getTranslations } from "next-intl/server";

import { DashboardCardsWrapper } from "@/components/dashboard/dashboard-cards-wrapper";
import LearningResourcesCard from "@/components/dashboard/learning-resource-card";
import NotificationsCard from "@/components/dashboard/notification-card";
import NotificationsDrawer from "@/components/dashboard/notifications-drawer";
import TasksCard from "@/components/dashboard/tasks-card";
import { ROLES } from "@/lib/schemas/auth";
import { requireRole } from "@/lib/server/auth";
import { getWeatherData } from "@/lib/utils/weather-data";

export default async function FarmOwnerDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(ROLES.FARM_OWNER, {
    unauthorizedRedirect: `/${locale}/unauthorized`,
  });
  const _t = await getTranslations("dashboard");

  // Fetch weather data on the server
  const weatherData = await getWeatherData();

  return (
    <div className="container w-full space-y-6 px-0 py-6">
      <div className="mb-16 flex flex-col gap-3 xl:mb-0 xl:flex-row">
        <div className="flex flex-col gap-4 xl:w-2/3">
          <DashboardCardsWrapper {...weatherData} />
        </div>

        <div className="flex flex-col gap-4 xl:w-1/3">
          <div className="flex flex-col gap-4">
            <NotificationsCard />
            <NotificationsDrawer />
            <LearningResourcesCard />
            <TasksCard />
          </div>
        </div>
      </div>
    </div>
  );
}
