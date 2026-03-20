"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { InviteMangerForm } from "@/components/forms/invite-manager-form";

export default function InviteFarmManagerPage() {
  const t = useTranslations("dashboard.inviteManager");
  const router = useRouter();

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <TopLeftHeaderLayout>
      <div className="px-4 py-6 md:items-center md:justify-center md:px-6 md:pt-0 lg:px-8">
        <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-2xl">
          <h1 className="mb-4 text-start text-3xl font-bold tracking-tight lg:text-center ">
            {t("title")}
          </h1>
          <InviteMangerForm
            onSuccess={() => {
              router.push("/farm-owner/invite-farm-manager/manager-work-type");
            }}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
