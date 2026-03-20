"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";

import ProgressStepper from "@/components/common/progress-stepper";
import useRequestStore from "@/lib/stores/requests-store/requests-store";

export default function ReviewRightContent() {
  const requestData = useRequestStore.use.requestData();
  const t = useTranslations("allRequests.reviewKyc.rightContent");
  return (
    <div className={"hidden w-[38%] border-l px-6 lg:block"}>
      <div className={"py-4"}>
        <h4 className={"font-bold"}>{t("requestDetail")}</h4>
      </div>
      <div className={"py-2"}>
        <p className={"text-secondary-foreground text-sm"}>
          {t("requestedOn")}
        </p>
        <p className={"text-sm"}>
          {requestData?.submittedDate
            ? format(requestData.submittedDate, "dd MMM yyyy hh:mma")
            : "N/A"}
        </p>
      </div>
      <div className={"py-2"}>
        <p className={"text-secondary-foreground text-sm"}>
          {t("requestType")}
        </p>
        <p className={"text-sm"}>{requestData?.type ?? ""}</p>
      </div>
      <div className={"py-2"}>
        <p className={"text-secondary-foreground text-sm"}>
          {t("requestedBy")}
        </p>
        <p className={"text-sm"}>{requestData?.userName ?? "N/A"}</p>
      </div>
      <hr className={"-mx-6 mt-4"} />
      <div className={"border-b py-4"}>
        <h4 className={"font-bold"}>{t("progress")}</h4>
      </div>

      <ProgressStepper
        progressList={[
          {
            title: "Under review",
            time: "4 Aug 2024, 3:45PM",
            description: "[AdminName] reviewing task detail",
          },
          {
            title: "Received",
            time: "21 Aug 2024, 9:35 AM",
            description: "Request received and queued for review",
          },
        ]}
      />
      <hr className={"-mx-6 mt-4"} />
    </div>
  );
}
