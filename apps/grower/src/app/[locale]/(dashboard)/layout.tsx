import { AppLayout } from "@/components/layout/app-layout";
import type { Locale } from "@/config/i18n-config";
import { NotificationsManager } from "@/lib/notifications/notifications-store";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <NotificationsManager>
      <AppLayout locale={locale}>{children}</AppLayout>
    </NotificationsManager>
  );
}
