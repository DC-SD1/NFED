"use client";

import { Button } from "@cf/ui";
import { React } from "@cf/ui/icons";
import { useTranslations } from "next-intl";

import DetailRowTile from "@/components/common/detail-row-tile";
import AppSheetModal from "@/components/sheets/app-sheet-modal";
import { useModal } from "@/lib/stores/use-modal";

export default function GrowerSuspensionReasonModal() {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "GrowerSuspensionReason";
  const t = useTranslations(
    "customerManagement.formalGrower.details.growerSuspensionReasonModal",
  );

  return (
    <AppSheetModal
      key={"grower-suspension-reason"}
      title={t("title")}
      open={isModalOpen}
      onClose={onClose}
      bodyClassName={
        "h-full flex flex-col justify-between overflow-hidden py-0"
      }
    >
      <div className="flex flex-1 flex-col gap-4 overflow-auto py-6">
        <div className={"flex flex-col gap-1 rounded-xl border p-4"}>
          <p className={"text-secondary-foreground text-sm font-bold"}>
            {t("reasonsForSuspension")}
          </p>
          <p>I am no longer cultivating crops and wish to close my account.</p>
        </div>
        <div className={"flex flex-col gap-3 rounded-xl border p-4"}>
          <p className={"font-bold"}>{t("requestInformation")}</p>
          <hr />
          <DetailRowTile
            title={t("requestedOn")}
            value={"4 Aug 2024 at 3:45PM"}
            valueClassName={"w-full flex justify-end"}
          />
          <hr />
          <DetailRowTile
            className={"items-start"}
            title={t("requestedBy")}
            value={
              <div className={"flex w-full justify-end"}>
                <div className={"flex flex-col items-end"}>
                  <p className={"text-sm"}>Stephen Appiah</p>
                  <p className={"text-secondary-foreground text-sm"}>
                    Self requested
                  </p>
                </div>
              </div>
            }
          />
          <hr />
          <DetailRowTile
            title={"Approved on"}
            value={"4 Aug 2024 at 3:45PM"}
            valueClassName={"w-full flex justify-end"}
          />
          <hr />
          <DetailRowTile
            title={t("approvedBy")}
            value={"Kelvin Boamponsem"}
            valueClassName={"w-full flex justify-end"}
          />
        </div>
        <div className={"flex flex-col gap-3 rounded-xl border p-4"}>
          <p className={"font-bold"}>{t("proofOfVerification")}</p>
          <hr />
          <p className={"text-sm"}>{t("noDocumentFound")}</p>
        </div>
      </div>
      <div
        className={
          "-mx-8 border-t px-8 pb-6 pt-4 shadow-[0_-1px_6px_0_#161D1414]"
        }
      >
        <Button className={"w-full rounded-xl"}>{t("reactivateGrower")}</Button>
      </div>
    </AppSheetModal>
  );
}
