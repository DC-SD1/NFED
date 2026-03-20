"use client";

import { Button, cn } from "@cf/ui";
import { useTranslations } from "next-intl";
import React from "react";

import useFulfilmentCenterStore from "@/lib/stores/fulfilment-center-store/fufilment-center-store";

interface Props {
  onDetailEdit?: () => void;
  onManagerEdit?: () => void;
  className?: string;
}

export default function ReviewAndConfirmCenterTab({
  onDetailEdit,
  onManagerEdit,
  className,
}: Props) {
  const t = useTranslations(
    "fulfillmentCenters.addNewCenter.reviewAndConfirmTab",
  );
  const cacheFormData = useFulfilmentCenterStore.use.cacheFormData();
  const photos = cacheFormData?.photos ?? [];

  return (
    <div className={cn("flex flex-col gap-[26px] p-10", className)}>
      <div>
        <h1 className={"text-xl font-bold"}>{t("pageTitle")}</h1>
        <p className={"text-sm text-secondary-foreground"}>
          {t("description")}
        </p>
      </div>

      <div className={"w-full rounded-xl border"}>
        <div className={"flex items-center justify-between p-4"}>
          <p className={"font-bold"}>{t("fulfillmentCenterDetails")}</p>
          <Button
            onClick={onDetailEdit}
            variant={"secondary"}
            className={"h-8 font-bold"}
          >
            {t("edit")}
          </Button>
        </div>
        <hr />
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("name")}</p>
          <p className={"text-sm"}>{cacheFormData?.name ?? "N/A"}</p>
        </div>
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("country")}</p>
          <p className={"text-sm"}>{cacheFormData?.country ?? "N/A"}</p>
        </div>
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("phoneNumber")}</p>
          <p className={"text-sm"}>{cacheFormData?.phoneNumber ?? ""}</p>
        </div>
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("location")}</p>
          <p className={"text-sm"}>{cacheFormData?.locationAddress ?? ""}</p>
        </div>
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("focusCrops")}</p>
          <p className={"text-sm"}>
            {cacheFormData?.focusCrops?.join(", ") ?? ""}
          </p>
        </div>
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("nearbyDistrictsServed")}</p>
          <p className={"text-sm"}>
            {cacheFormData?.assignedDistricts?.join(", ") ?? ""}
          </p>
        </div>
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("photos")}</p>
          <p className={"text-sm"}>
            {photos.length} {photos.length === 1 ? "photo" : "photos"} added
          </p>
        </div>
      </div>

      <div className={"w-full rounded-xl border"}>
        <div className={"flex items-center justify-between p-4"}>
          <p className={"font-bold"}>{t("managementTeamAssignment")}</p>
          <Button
            onClick={onManagerEdit}
            variant={"secondary"}
            className={"h-8 font-bold"}
          >
            {t("edit")}
          </Button>
        </div>
        <hr />
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("regionalManager")}</p>
          <p className={"text-sm"}>
            {cacheFormData?.selectedRom?.label ?? "Not provided"}
          </p>
        </div>
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("operationDirector")}</p>
          <p className={"text-sm"}>
            {cacheFormData?.selectedOd?.label ?? "Not provided"}
          </p>
        </div>
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("warehouseManager")}</p>
          <p className={"text-sm"}>
            {cacheFormData?.selectedWm?.label ?? "Not provided"}
          </p>
        </div>
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("fieldAgronomist")}</p>
          <p className={"text-sm"}>
            {cacheFormData?.selectedFa?.label ?? "Not provided"}
          </p>
        </div>
        <div className={"flex items-center justify-between px-4 py-3"}>
          <p className={"text-sm"}>{t("fieldCoordinator")}</p>
          <p className={"text-sm"}>
            {cacheFormData?.selectedFc?.label ?? "Not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}
