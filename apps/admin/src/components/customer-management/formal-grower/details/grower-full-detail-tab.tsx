"use client";

import { useTranslations } from "next-intl";

import CopyTextButton from "@/components/buttons/copy-text-button";
import DetailRowTile from "@/components/common/detail-row-tile";
import type { FormalGrower } from "@/types/formal-grower.types";
import { STATUS_COLORS } from "@/utils/constants/status-constants";
import { formatTimeAgo } from "@/utils/helpers/date-time-helper";

interface Props {
  grower?: FormalGrower;
}

export default function GrowerFullDetailTab({ grower }: Props) {
  const t = useTranslations("customerManagement.formalGrower.details.sideMenu");
  return (
    <div className={"flex flex-col px-6 pb-4"}>
      <DetailRowTile title={"Customer type"} value={t("formalGrower")} />
      <DetailRowTile
        title={t("phone")}
        value={grower?.phoneNumber ?? ""}
        actionButton={<CopyTextButton textToCopy={grower?.phoneNumber ?? ""} />}
      />
      <DetailRowTile
        title={t("email")}
        value={grower?.email ?? ""}
        actionButton={<CopyTextButton textToCopy={grower?.email ?? ""} />}
      />
      <DetailRowTile title={"Country"} value={grower?.country ?? ""} />
      <DetailRowTile title={"Region"} value={grower?.region ?? ""} />
      <DetailRowTile title={"District"} value={"N/A"} />
      <DetailRowTile
        title={t("assignedRom")}
        value={
          <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
            {t("notAssigned")}
          </div>
        }
      />
      <DetailRowTile
        title={"Assigned agent"}
        value={
          <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
            {t("notAssigned")}
          </div>
        }
      />
      <DetailRowTile
        title={"Last activity"}
        value={
          grower?.lastLoginAt
            ? formatTimeAgo(new Date(grower?.lastLoginAt ?? ""))
            : "N/A"
        }
      />
      <DetailRowTile
        title={t("fulfillmentCenter")}
        value={
          <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
            {t("notAssigned")}
          </div>
        }
      />
      <DetailRowTile
        title={"Approved by"}
        value={
          <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
            {t("notAssigned")}
          </div>
        }
      />
      <DetailRowTile
        title={t("status")}
        value={grower?.status ?? ""}
        valueClassName={
          STATUS_COLORS[grower?.status?.toLowerCase() ?? ""] ||
          "text-foreground"
        }
      />
    </div>
  );
}
