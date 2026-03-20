import { AppLayout } from "@/components/layout/app-layout";
import type { Locale } from "@/config/i18n-config";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: Locale }>;
}) {
  const { locale } = await params;

  return <AppLayout locale={locale}>{children}</AppLayout>;
}
