import { requireAuth } from "@/lib/server/auth";

import ProfilePageClient from "./profile-client";

export default async function ProfilePageServer({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireAuth(`/${locale}/`);

  return <ProfilePageClient locale={locale} user={user} />;
}
