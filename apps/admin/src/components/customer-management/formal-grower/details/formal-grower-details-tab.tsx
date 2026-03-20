"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";

import GrowerFullDetailTab from "@/components/customer-management/formal-grower/details/grower-full-detail-tab";
import GrowerKycTab from "@/components/customer-management/formal-grower/details/grower-kyc-tab";
import GrowerPaymentInfoTab from "@/components/customer-management/formal-grower/details/grower-payment-info-tab";
import AppTabs from "@/components/tabs/app-tabs";
import type { FormalGrower } from "@/types/formal-grower.types";
import { formatTimeAgo } from "@/utils/helpers/date-time-helper";
import { ImageAssets } from "@/utils/image-assets";

interface Props {
  grower?: FormalGrower;
}

export default function FormalGrowerDetailsTab({ grower }: Props) {
  const t = useTranslations(
    "customerManagement.formalGrower.details.detailsTab",
  );

  return (
    <div className={"flex flex-col gap-4"}>
      <div
        className={"flex w-full items-center gap-4 rounded-xl border px-6 py-4"}
      >
        <Image
          src={ImageAssets.AVATAR_FEMALE}
          alt={"avatar"}
          className={"size-[84px] rounded-full object-contain"}
        />
        <div>
          <p className={"text-[28px] font-bold"}>{grower?.growerName ?? ""}</p>
          <p className={"text-secondary-foreground"}>{t("formalGrower")}</p>
          <p className={"text-secondary-foreground"}>
            {t("lastActivity")}:{" "}
            {grower?.lastLoginAt
              ? formatTimeAgo(new Date(grower?.lastLoginAt ?? ""))
              : "N/A"}
          </p>
        </div>
      </div>
      <div className={"rounded-xl border py-2"}>
        <AppTabs
          tabs={[
            {
              value: "detail",
              label: t("tabs.detail"),
              content: <GrowerFullDetailTab grower={grower} />,
            },
            {
              value: "kyc",
              label: t("tabs.kyc"),
              content: <GrowerKycTab />,
            },
            {
              value: "payment-info",
              label: t("tabs.paymentInfo"),
              content: <GrowerPaymentInfoTab />,
            },
          ]}
          defaultValue={"detail"}
        />
      </div>
    </div>
  );
}
