import { createClerkClient } from "@clerk/backend";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { Loader } from "@/components/ui/loader";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function InviteServerPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const email =
    typeof resolvedSearchParams.email === "string"
      ? resolvedSearchParams.email
      : undefined;
  const referrer =
    typeof resolvedSearchParams.referrer === "string"
      ? resolvedSearchParams.referrer
      : undefined;

  if (!email || !referrer) {
    redirect("/oops");
  }
  let success = false;
  try {
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (users.data.length > 0) {
      const user = users.data[0];
      if (!user) {
        redirect("/oops");
      }
      success = true;
    }
  } catch (err) {
    redirect("/oops");
  }
  if (success) {
    redirect(`/otp?mode=reset&email=${encodeURIComponent(email)}`);
  } else {
    redirect("/oops");
  }
  return null;
}

export default function InvitePageWrapper({ searchParams }: PageProps) {
  const t = useTranslations("common");
  return (
    <Suspense fallback={<Loader message={t("processing_invitation")} />}>
      <InviteServerPage searchParams={searchParams} />
    </Suspense>
  );
}
