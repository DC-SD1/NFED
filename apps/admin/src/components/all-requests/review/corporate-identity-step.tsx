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

export default function CorporateIdentityStep() {
  const t = useTranslations("allRequests.reviewKyc");
  const tt = useTranslations("common.errors");
  const api = useApiClient();
  const queryClient = useQueryClient();
  const {
    requestData,
    kycResponse,
    setDocumentStatus,
    setDocumentDeclineReason,
  } = useRequestStore();
  const { onOpen } = useModal();
  const kycData = kycResponse as KycResponse;
  const corpIdentity = kycData.value?.documents?.corp_identity || [];
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
        {t("tabs.corporateIdentity")}
      </h1>

      {corpIdentity.length > 0 ? (
        corpIdentity.map((identity, index) => (
          <ApprovalTileItem
            key={index}
            title={""}
            value={humanizeLabel(identity?.file_name || "N/A")}
            onViewClick={() =>
              handleViewImage(identity?.file_url, identity?.file_name || "")
            }
            onApproveClick={() => {
              handleUpdateDocument(identity?.file_name ?? "", "Accepted");
            }}
            onDeclineClick={() => {
              setDocumentStatus(
                "corp_identity",
                identity?.file_name ?? "",
                "Required",
              );
            }}
            status={(identity?.document_status || "").toLowerCase()}
            onReasonChange={(reason) => {
              setDocumentDeclineReason(
                "corp_identity",
                identity?.file_name ?? "",
                reason,
              );
            }}
            onDeclineCancelClick={() => {
              setDocumentStatus(
                "corp_identity",
                identity?.file_name ?? "",
                "Pending",
              );
            }}
            onDeclineSaveClick={() => {
              handleUpdateDocument(
                identity?.file_name ?? "",
                "Declined",
                identity?.status_error_message,
              );
            }}
            onChangeClick={() => {
              setDocumentStatus(
                "corp_identity",
                identity?.file_name ?? "",
                "Pending",
              );
            }}
            reason={identity?.status_error_message ?? ""}
            isLoading={isPending}
            noAction={!isKycPending}
            kycStatus={kycData.value?.kycStatus ?? ""}
          />
        ))
      ) : (
        <div className="bg-secondary w-fit rounded-md px-2 py-0.5 text-xs">
          <p>{t("mainContent.noCertificatesUploaded")}</p>
        </div>
      )}
    </div>
  );
}
