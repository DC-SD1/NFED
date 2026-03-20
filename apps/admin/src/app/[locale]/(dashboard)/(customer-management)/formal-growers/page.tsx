

import type { Metadata } from "next";
import {getTranslations} from "next-intl/server";

import FormalGrowerContent from "@/components/customer-management/formal-grower/formal-grower-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customerManagement.formalGrower");

  return {
    title: t("pageTitle"),
  };
}

export default async function FormalGrowerPage() {
  return <FormalGrowerContent />
}
