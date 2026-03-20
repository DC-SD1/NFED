

import type { Metadata } from "next";
import {getTranslations} from "next-intl/server";

import UserManagementContent from "@/components/user-management/user-management-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("userManagement");

  return {
    title: t("pageTitle"),
  };
}

export default async function UserManagementPage() {
  return <UserManagementContent />
}
