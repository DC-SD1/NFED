"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import ContentEmptyState from "@/components/common/content-empty-state";
import DetailRowTile from "@/components/common/detail-row-tile";
import KycItemTile from "@/components/customer-management/formal-grower/details/kyc-item-tile";
import { ImageAssets } from "@/utils/image-assets";

export default function AgentKycTab() {
  const t = useTranslations(
    "customerManagement.agents.details.detailsTab.kycTab",
  );
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEmpty(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={"flex flex-col px-6 pb-4"}>
      {isEmpty ? (
        <div className={"py-6"}>
          <ContentEmptyState
            className={"w-full"}
            imageClassName={"mr-4"}
            imgSrc={ImageAssets.KYC}
            title={t("emptyState.title")}
            message={t("emptyState.description")}
          />
        </div>
      ) : (
        <>
          <div className={"flex flex-col gap-6 pt-2"}>
            <KycItemTile
              title={t("ghanaCardFrontView")}
              value={
                <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                  {t("notAssigned")}
                </div>
              }
              onView={() => {
                //empty
              }}
            />

            <KycItemTile
              title={t("ghanaCardBackView")}
              value={
                <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                  {t("notAssigned")}
                </div>
              }
              onView={() => {
                //empty
              }}
            />
          </div>

          <div className={"-mx-6 my-4 h-2 bg-[#F3F7F2]"} />

          <KycItemTile
            title={t("trainingCertificate")}
            value={
              <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                {t("notAssigned")}
              </div>
            }
            onView={() => {
              //empty
            }}
          />

          <div className={"-mx-6 my-4 h-2 bg-[#F3F7F2]"} />

          <div className={"flex flex-col gap-4 py-2"}>
            <p className={"font-bold"}>{t("kycApprovalDetail")}</p>
            <hr />
            <DetailRowTile
              title={t("approvedBy")}
              value={
                <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-sm">
                  {t("notAssigned")}
                </div>
              }
            />
            <DetailRowTile
              title={t("approvedDateAndTime")}
              value={
                <div className="bg-secondary rounded-md px-2 py-0.5 text-sm">
                  {t("notAssigned")}
                </div>
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
