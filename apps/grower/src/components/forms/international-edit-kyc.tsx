/* eslint-disable max-lines-per-function */
"use client";

import { Button, FormInput } from "@cf/ui";
import { FormDateInput } from "@cf/ui/components/form-date-time";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useApiClient } from "@/lib/api";
import { useGetKyc } from "@/lib/queries/kyc-query";
import { internationalIdDocumentSchema } from "@/lib/schemas/farm-manager-details";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { useModal } from "@/lib/stores/use-modal";
import {
  getFileNameFromUrl,
  handlePostCodeInput,
} from "@/lib/utils/string-helpers";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import ResidentEditKycSkeleton from "../dashboard/skeletons/resident-edit-skeleton";
import FileCard from "../documents-kyc-card";
import type { InternationalIdDocumentFormData } from "./international-kyc-submit";

// Helper function to safely format dates
const safeFormatDate = (dateString: string | undefined | null) => {
  if (!dateString) return "";
  const date = parseISO(dateString);
  return isValid(date) ? format(date, "dd/MM/yyyy") : "";
};

interface DocumentItem {
  file_url: string;
  file_type: number;
  file_name: string;
  uploaded_date: string;
}

interface UpdatedKycData {
  passportExpirationDate?: string;
  visaExpirationDate?: string;
  ghanaPostCode?: string;
  proofOfAddressType?: string;
}

export default function InternationalEditKyc() {
  const t = useTranslations("dashboard.kyc.international");
  const tOther = useTranslations("dashboard.kyc");
  const { onOpen } = useModal();
  const api = useApiClient();
  const router = useRouter();
  const [isDraft, setIsDraft] = useState(true);
  const [updatedDocuments, setUpdatedDocuments] = useState<
    Record<string, DocumentUploadResponse>
  >({});
  const { userId: authId } = useAuthUser();

  const { kycData: kycResponse, isLoading, refetch } = useGetKyc();

  const internationalKYC = kycResponse?.value || null;
  const intlDocs = internationalKYC?.documents?.grower_intl_documents || [];
  const kycDetails = internationalKYC?.details;

  const methods = useForm<InternationalIdDocumentFormData>({
    resolver: zodResolver(internationalIdDocumentSchema),
    defaultValues: {
      passportExpirationDate: safeFormatDate(
        kycDetails?.grower_intl?.passport_expire_date,
      ),
      visaExpirationDate: safeFormatDate(
        kycDetails?.grower_intl?.visa_expire_date,
      ),
      ghanaPostCode: kycDetails?.grower_intl?.postal_code || "0000",
    },
  });

  const { control, setValue, handleSubmit, watch, reset } = methods;

  const watchedPassportDate = watch("passportExpirationDate");
  const watchedVisaDate = watch("visaExpirationDate");
  const watchedGhanaPostCode = watch("ghanaPostCode");

  const updatedKycData: UpdatedKycData = useMemo(() => {
    const originalPassportDate = safeFormatDate(
      kycDetails?.grower_intl?.passport_expire_date,
    );
    const originalVisaDate = safeFormatDate(
      kycDetails?.grower_intl?.visa_expire_date,
    );
    const originalGhanaPostCode =
      kycDetails?.grower_intl?.postal_code || "0000";

    const changes: UpdatedKycData = {};

    changes.passportExpirationDate =
      watchedPassportDate !== originalPassportDate
        ? watchedPassportDate
        : originalPassportDate;
    changes.visaExpirationDate =
      watchedVisaDate !== originalVisaDate ? watchedVisaDate : originalVisaDate;
    changes.ghanaPostCode =
      watchedGhanaPostCode !== originalGhanaPostCode
        ? watchedGhanaPostCode
        : originalGhanaPostCode;
    return changes;
  }, [watchedPassportDate, watchedVisaDate, watchedGhanaPostCode, kycDetails]);

  const updateDocumentsMutation = api.useMutation(
    "put",
    "/kyc/update-documents",
    {
      onSuccess: async () => {
        showSuccessToast("Documents updated successfully!");
        await refetch();
      },
      onError: () => {
        showErrorToast("Failed to update documents. Please try again.");
      },
    },
  );

  const submitMutation = api.useMutation("post", "/kyc/submit", {
    onSuccess: () => {
      showSuccessToast("KYC information submitted successfully!");
      router.push("/profile");
    },
    onError: () => {
      showErrorToast("Failed to submit KYC information. Please try again.");
    },
  });

  const updateDetailsMutation = api.useMutation("put", "/kyc/update-details", {
    onSuccess: async () => {
      showSuccessToast("KYC details updated successfully!");
      await refetch();
    },
    onError: () => {
      showErrorToast("Failed to update KYC details. Please try again.");
    },
  });

  // Use .find() for robustness instead of array index
  const categorizedDocs = {
    passport: intlDocs.find((doc) => doc.file_name === "passport"),
    visa: intlDocs.find((doc) => doc.file_name === "visa"),
    proofOfAddress: intlDocs.find(
      (doc) => doc.file_name === "proof_of_address",
    ),
  };

  const getProofOfAddressType = (
    filename: string,
  ): "ghana_post_code" | "utility_bill" | "bank_statement" => {
    if (filename === "proof_of_address") {
      return "utility_bill";
    }
    return "ghana_post_code";
  };

  const onRemove = (
    docType: "proofOfAddress" | "id" | "passport" | "visa" | undefined,
    proofOfAddressType?: "ghana_post_code" | "utility_bill" | "bank_statement",
  ) => {
    onOpen("UpdateKycDocuments", {
      uploadDocType: docType,
      proofOfAddressType,
      onDocumentUploaded: (
        documentType: string,
        documentData: DocumentUploadResponse,
      ) => {
        setUpdatedDocuments((prev) => ({
          ...prev,
          [documentType]: documentData,
        }));
      },
      onKycDataUpdated: (kycData: UpdatedKycData) => {
        if (kycData.passportExpirationDate !== undefined) {
          setValue("passportExpirationDate", kycData.passportExpirationDate);
        }
        if (kycData.visaExpirationDate !== undefined) {
          setValue("visaExpirationDate", kycData.visaExpirationDate);
        }
        if (kycData.ghanaPostCode !== undefined) {
          setValue("ghanaPostCode", kycData.ghanaPostCode);
        }
      },
    });
  };

  const hasAnyChanges =
    Object.keys(updatedDocuments).length > 0 ||
    Object.keys(updatedKycData).length > 0;

  const buildFinalDocuments = () => {
    const nowIso = new Date().toISOString();
    const existingDocuments = internationalKYC?.documents || {
      corp_identity: [],
      finance: [],
      auth_rep: [],
      grower_local_documents: [],
      grower_intl_documents: [],
    };

    const finalDocuments = {
      ...existingDocuments,
      grower_intl_documents: [
        ...(existingDocuments.grower_intl_documents || []),
      ],
    };

    if (Object.keys(updatedDocuments).length > 0) {
      const updateDocument = (
        arr: DocumentItem[],
        fileName: string,
        newDoc: DocumentItem,
      ) => {
        const index = arr.findIndex((doc) => doc.file_name === fileName);
        if (index !== -1) arr[index] = newDoc;
        else arr.push(newDoc);
      };

      Object.entries(updatedDocuments).forEach(([key, docData]) => {
        let fileName = "";
        if (key === "passportDocument") fileName = "passport";
        else if (key === "visaDocument") fileName = "visa";
        else if (key === "proofOfAddress") fileName = "proof_of_address";
        if (!fileName) return;

        const newDoc: DocumentItem = {
          file_url: docData.downloadUrl,
          file_type: 0,
          file_name: fileName,
          uploaded_date: nowIso,
        };
        updateDocument(
          finalDocuments.grower_intl_documents as any,
          fileName,
          newDoc,
        );
      });
    }

    return finalDocuments;
  };

  const buildFinalDetails = () => {
    const currentDetails = kycDetails || {};
    const currentGrowerIntl = currentDetails.grower_intl || {};

    return {
      grower_intl: {
        postal_code:
          updatedKycData.ghanaPostCode !== undefined
            ? updatedKycData.ghanaPostCode || "0000"
            : currentGrowerIntl.postal_code || "0000",
        passport_expire_date:
          updatedKycData.passportExpirationDate ||
          currentGrowerIntl.passport_expire_date ||
          "",
        visa_expire_date:
          updatedKycData.visaExpirationDate ||
          currentGrowerIntl.visa_expire_date ||
          "",
        proof_of_address_type:
          updatedKycData.proofOfAddressType ||
          currentGrowerIntl.proof_of_address_type ||
          "utility_bill",
      },
      ...(currentDetails.grower_local && {
        grower_local: currentDetails.grower_local,
      }),
    };
  };

  const onSubmit = async () => {
    if (!authId) {
      showErrorToast("User not authenticated");
      return;
    }
    if (!hasAnyChanges) {
      showSuccessToast("No changes to update!");
      return;
    }

    if (isDraft) {
      if (Object.keys(updatedDocuments).length > 0) {
        const nowIso = new Date().toISOString();
        const existingDocuments = internationalKYC?.documents || {
          corp_identity: [],
          finance: [],
          auth_rep: [],
          grower_local_documents: [],
          grower_intl_documents: [],
        };
        const updatedDocumentsPayload = {
          ...existingDocuments,
          grower_intl_documents: [
            ...(existingDocuments.grower_intl_documents || []),
          ],
        };

        const updateDocument = (
          arr: DocumentItem[],
          fileName: string,
          newDoc: DocumentItem,
        ) => {
          const index = arr.findIndex((doc) => doc.file_name === fileName);
          if (index !== -1) arr[index] = newDoc;
          else arr.push(newDoc);
        };

        Object.entries(updatedDocuments).forEach(([key, docData]) => {
          let fileName = "";
          if (key === "passportDocument") fileName = "passport";
          else if (key === "visaDocument") fileName = "visa";
          else if (key === "proofOfAddress") fileName = "proof_of_address";
          if (!fileName) return;

          const newDoc: DocumentItem = {
            file_url: docData.downloadUrl,
            file_type: 0,
            file_name: fileName,
            uploaded_date: nowIso,
          };
          updateDocument(
            updatedDocumentsPayload.grower_intl_documents as any,
            fileName,
            newDoc,
          );
        });

        await updateDocumentsMutation.mutateAsync({
          body: { userId: authId, documents: updatedDocumentsPayload } as any,
        });
      }
      if (Object.keys(updatedKycData).length > 0) {
        await updateDetailsMutation.mutateAsync({
          body: {
            userId: authId,
            details: {
              grower_intl: {
                ...(updatedKycData.ghanaPostCode !== undefined && {
                  postal_code: updatedKycData.ghanaPostCode || "0000",
                }),
                ...(updatedKycData.passportExpirationDate && {
                  passport_expire_date: updatedKycData.passportExpirationDate,
                }),
                ...(updatedKycData.visaExpirationDate && {
                  visa_expire_date: updatedKycData.visaExpirationDate,
                }),
                ...(updatedKycData.proofOfAddressType && {
                  proof_of_address_type: updatedKycData.proofOfAddressType,
                }),
              },
            },
          } as any,
        });
      }
    } else {
      const finalDocuments = buildFinalDocuments();
      const finalDetails = buildFinalDetails();

      await submitMutation.mutateAsync({
        body: {
          userId: authId,
          kycStatus: "Draft",
          submittedDate: new Date().toISOString(),
          kycType: "GrowerInternational",
          details: finalDetails as any,
          documents: finalDocuments as any,
        },
      });
    }

    setUpdatedDocuments({});
    reset({
      passportExpirationDate: safeFormatDate(
        kycDetails?.grower_intl?.passport_expire_date,
      ),
      visaExpirationDate: safeFormatDate(
        kycDetails?.grower_intl?.visa_expire_date,
      ),
      ghanaPostCode: kycDetails?.grower_intl?.postal_code || "0000",
    });

    router.push("/profile");
  };

  if (isLoading) {
    return <ResidentEditKycSkeleton />;
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col items-center justify-center px-1 py-2 md:px-4">
        <div className="w-full max-w-lg space-y-8 md:max-w-4xl lg:max-w-2xl">
          <div className="space-y-3 text-left md:text-center">
            <p className="text-sm text-muted-foreground">{t("editSubTitle")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <p className="!mb-0 text-sm font-semibold">{t("uploadPassport")}</p>
            <FileCard
              filename={getFileNameFromUrl(
                updatedDocuments.passportDocument?.downloadUrl ||
                  categorizedDocs.passport?.file_url ||
                  "",
              )}
              fileType="passport"
              onRemove={() => onRemove("passport")}
            />
            <p className="!mb-0 text-sm font-semibold">{t("passExpiry")}</p>
            <FormDateInput
              name="passportExpirationDate"
              control={control}
              className="w-3/4 border-input-border xl:w-1/2"
            />

            <p className="!mb-0 text-sm font-semibold">{t("uploadVisa")}</p>
            <FileCard
              filename={getFileNameFromUrl(
                updatedDocuments.visaDocument?.downloadUrl ||
                  categorizedDocs.visa?.file_url ||
                  "",
              )}
              fileType="visa"
              onRemove={() => onRemove("visa")}
            />
            <p className="!mb-0 text-sm font-semibold">{t("visaExpiry")}</p>
            <FormDateInput
              name="visaExpirationDate"
              control={control}
              className="w-3/4 border-input-border xl:w-1/2"
            />

            <p className="!mb-0 text-sm font-semibold">{t("proofOfAddress")}</p>
            {kycDetails?.grower_intl?.proof_of_address_type ===
            "ghana_post_code" ? (
              <FormInput
                name="ghanaPostCode"
                type="text"
                placeholder="E.g. GA 000-0000"
                className="w-3/4  border-input-border xl:w-1/2"
                pattern="[a-zA-Z0-9-]*"
                onInput={handlePostCodeInput}
              />
            ) : (
              <FileCard
                filename={getFileNameFromUrl(
                  updatedDocuments.proofOfAddress?.downloadUrl ||
                    categorizedDocs.proofOfAddress?.file_url ||
                    "",
                )}
                fileType="proof_of_address"
                onRemove={() =>
                  onRemove(
                    "proofOfAddress",
                    getProofOfAddressType(
                      categorizedDocs.proofOfAddress?.file_name || "",
                    ),
                  )
                }
              />
            )}

            <div className="flex flex-col items-center justify-center gap-4">
              <Button
                type="submit"
                className="w-3/4"
                onClick={() => {
                  setIsDraft(false);
                }}
                disabled={
                  submitMutation.isPending ||
                  updateDocumentsMutation.isPending ||
                  updateDetailsMutation.isPending ||
                  !hasAnyChanges
                }
              >
                {submitMutation.isPending ? "Submitting..." : tOther("save")}
              </Button>

              <Button
                type="submit"
                variant="secondary"
                className="w-3/4 rounded-xl bg-gray-light text-[#1A5514] hover:bg-gray-light/90"
                onClick={() => {
                  setIsDraft(true);
                }}
                disabled={
                  updateDocumentsMutation.isPending ||
                  updateDetailsMutation.isPending ||
                  submitMutation.isPending ||
                  !hasAnyChanges
                }
              >
                {updateDocumentsMutation.isPending ||
                updateDetailsMutation.isPending
                  ? "Updating..."
                  : tOther("saveUpdate")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
