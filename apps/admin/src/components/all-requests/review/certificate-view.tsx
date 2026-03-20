"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import ApprovalTileItem from "@/components/all-requests/review/approval-tile-item";
import { useApiClient } from "@/lib/api";
import useRequestStore from "@/lib/stores/requests-store/requests-store";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { KycResponse } from "@/types/all-request.types";
import { humanizeLabel } from "@/utils/helpers/common-helpers";

export default function CertificateView() {
  const t = useTranslations("allRequests.reviewKyc");
  const tt = useTranslations("common.errors");
  const { onOpen } = useModal();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const {
    requestData,
    kycResponse,
    setDocumentStatus,
    setDocumentDeclineReason,
  } = useRequestStore();
  const kycData = kycResponse as KycResponse;
  const certification = kycData.value?.documents?.certification;
  const isKycPending = kycData.value?.kycStatus === "Submitted";

  const { mutate, isPending } = api.useMutation(
    "put",
    "/kyc/update-document-status",
    {
      onSuccess: async (_, variables) => {
        await queryClient.invalidateQueries({
          queryKey: ["get", "/kyc/get-kyc"],
        });
        showSuccessToast(
          `${variables.body.status === "Accepted" ? t("mainContent.approved") : t("mainContent.declined")}`,
        );
      },
      onError: (error: any) => {
        const errorMessage = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessage ?? tt("unknown_error"));
      },
    },
  );

  const handleViewImage = (fileUrl?: string, title?: string) => {
    if (fileUrl?.toLowerCase().endsWith(".pdf")) {
      window.open(fileUrl, "_blank");
      return;
    }
    onOpen("ImageView", {
      title,
      fileUrl,
    });
  };

  const handleUpdateDocument = (
    documentName: string,
    status: string,
    message?: string | null,
  ) => {
    mutate({
      body: {
        userId: requestData?.userId,
        documentName,
        status,
        message,
      },
    });
  };

  return (
    <div className={"flex flex-col gap-[26px] p-10"}>
      <h1 className={"text-lg font-bold sm:text-2xl"}>
        {t("tabs.certificates")}
      </h1>

      {certification ? (
        <ApprovalTileItem
          title={"Certification"}
          value={humanizeLabel(certification?.file_name || "N/A")}
          onViewClick={() =>
            handleViewImage(certification?.file_url, "Certification")
          }
          onApproveClick={() => {
            handleUpdateDocument(certification?.file_name ?? "", "Accepted");
          }}
          onDeclineClick={() => {
            setDocumentStatus(
              "certification",
              certification?.file_name ?? "",
              "Required",
            );
          }}
          status={(certification?.document_status || "").toLowerCase()}
          onReasonChange={(reason) => {
            setDocumentDeclineReason(
              "certification",
              certification?.file_name ?? "",
              reason,
            );
          }}
          onDeclineCancelClick={() => {
            setDocumentStatus(
              "certification",
              certification?.file_name ?? "",
              "Pending",
            );
          }}
          onDeclineSaveClick={() => {
            handleUpdateDocument(
              certification?.file_name ?? "",
              "Declined",
              certification?.status_error_message,
            );
          }}
          onChangeClick={() => {
            setDocumentStatus(
              "certification",
              certification?.file_name ?? "",
              "Pending",
            );
          }}
          reason={certification?.status_error_message ?? ""}
          isLoading={isPending}
          kycStatus={kycData.value?.kycStatus ?? ""}
          noAction={!isKycPending}
        />
      ) : (
        <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-xs">
          <p>{t("mainContent.noCertificatesUploaded")}</p>
        </div>
      )}
    </div>
  );
}
