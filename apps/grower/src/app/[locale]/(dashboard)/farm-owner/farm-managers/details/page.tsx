import { ROLES } from "@/lib/schemas/auth";
import { requireRole } from "@/lib/server/auth";

import ManagerDetailsClient from "./managers-details.client";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id: string }>;
}

export default async function ManagerDetails({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { id } = await searchParams;

  const _user = await requireRole(ROLES.FARM_OWNER, {
    unauthorizedRedirect: `/${locale}/unauthorized`,
  });

  return <ManagerDetailsClient id={id} />;
}
