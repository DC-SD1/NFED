"use client";

import { useTranslations } from "next-intl";

import CopyTextButton from "@/components/buttons/copy-text-button";
import DetailRowTile from "@/components/common/detail-row-tile";
import type { FulfilmentCenter } from "@/types/fulfilment-centers.types";

interface Props {
  center?: FulfilmentCenter | null;
}

export default function FulfilmentCenterFullDetailTab({ center }: Props) {
  const t = useTranslations("fulfillmentCenters.details.info");

  const regionalManager = (center?.managers ?? []).find(
    (manager) => manager.role === "RegionalOperationsManager",
  );
  const operationsDirector = (center?.managers ?? []).find(
    (manager) => manager.role === "OperationsDirector",
  );
  const warehouseManager = (center?.managers ?? []).find(
    (manager) => manager.role === "WarehouseManager",
  );
  const fieldAgronomist = (center?.managers ?? []).find(
    (manager) => manager.role === "FieldAgronomist",
  );
  const fieldCoordinator = (center?.managers ?? []).find(
    (manager) => manager.role === "FieldCoordinator",
  );
  const nearbyRegionsServed = center?.assignedDistricts ?? [];
  const focusedCrops = center?.focusCrops ?? [];

  return (
    <div className={"flex flex-col px-6 pb-4"}>
      <DetailRowTile
        title={t("countryOfOperation")}
        value={center?.country ?? ""}
      />
      <DetailRowTile
        title={t("phoneNumber")}
        value={center?.phoneNumber ?? ""}
        actionButton={<CopyTextButton textToCopy={center?.phoneNumber ?? ""} />}
      />
      <DetailRowTile title={t("region")} value={center?.region ?? "N/A"} />
      <DetailRowTile
        title={t("nearbyRegionsServed")}
        value={nearbyRegionsServed.join(", ") ?? ""}
      />
      <DetailRowTile
        title={t("focusedCrops")}
        value={focusedCrops.join(", ") ?? ""}
      />
      <DetailRowTile
        title={t("regionalManager")}
        value={regionalManager?.fullName ?? "N/A"}
      />
      <DetailRowTile
        title={t("operationsDirector")}
        value={operationsDirector?.fullName ?? "N/A"}
      />
      <DetailRowTile
        title={t("warehouseManager")}
        value={warehouseManager?.fullName ?? "N/A"}
      />
      <DetailRowTile
        title={t("fieldAgronomist")}
        value={fieldAgronomist?.fullName ?? "N/A"}
      />
      <DetailRowTile
        title={t("fieldCoordinator")}
        value={fieldCoordinator?.fullName ?? "N/A"}
      />
      <DetailRowTile
        title={t("googleMapLink")}
        value={center?.googleMapLink ?? "N/A"}
        actionButton={
          center?.googleMapLink ? (
            <a
              href={center.googleMapLink}
              target="_blank"
              rel="noreferrer"
              className="flex size-6 items-center justify-center rounded border bg-[#ECFDF3]"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 1H11M11 1V7M11 1L1 11"
                  stroke="#1A5514"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          ) : undefined
        }
      />
      <DetailRowTile
        title={t("status")}
        value={"Active"}
        valueClassName={"text-primary"}
      />
    </div>
  );
}
