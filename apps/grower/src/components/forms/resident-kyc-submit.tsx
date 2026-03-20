"use client";

import { Button } from "@cf/ui";
import { FormDateInput } from "@cf/ui/components/form-date-time";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useKycDocumentUpload } from "@/hooks/use-kyc-document-upload";
import { useApiClient } from "@/lib/api";
import { idDocumentSchema } from "@/lib/schemas/farm-manager-details";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { showErrorToast } from "@/lib/utils/toast";

import { ProofOfAddressSection } from "../dashboard/uploads/address-proof";
import { DocumentUploadSection } from "../dashboard/uploads/document-upload";

export interface IdDocumentFormData {
  primaryId: DocumentUploadResponse | null;
  secondaryId: DocumentUploadResponse | null;
  documentType: "voter_id" | "passport" | null;
  expirationDate: string;
  proofOfAddressType:
    | "ghana_post_code"
    | "utility_bill"
    | "bank_statement"
    | null;
  ghanaPostCode: string;
  proofOfAddressDocument: DocumentUploadResponse | null;
}

// eslint-disable-next-line max-lines-per-function
export default function IdDocumentUploadForm() {
  const router = useRouter();
  const t = useTranslations("dashboard.kyc");
  const { uploadFunction } = useKycDocumentUpload();
  const api = useApiClient();
  const { userId } = useAuthUser();

  const methods = useForm<IdDocumentFormData>({
    resolver: zodResolver(idDocumentSchema),
    mode: "onChange",
    defaultValues: {
      expirationDate: "",
      ghanaPostCode: "",
    },
  });

  const { control, handleSubmit: handleFormSubmit, watch, formState } = methods;
  const { isValid, isSubmitting } = formState;

  const expirationDate = watch("expirationDate");

  const [formData, setFormData] = useState<IdDocumentFormData>({
    primaryId: null,
    secondaryId: null,
    documentType: null,
    expirationDate: "",
    proofOfAddressType: null,
    ghanaPostCode: "",
    proofOfAddressDocument: null,
  });

  const [selectedDocumentType, setSelectedDocumentType] = useState<
    "voter_id" | "passport" | null
  >(null);

  const draftMutation = api.useMutation("post", "/kyc/draft", {
    onSuccess: () => {
      router.push("/farm-owner/kyc/certification");
    },
    onError: () => {
      showErrorToast("Failed to save KYC draft. Please try again.");
    },
  });

  const handlePrimaryIdUploadStart = (uploadedFile: File) => {
    console.log("Primary ID upload started:", uploadedFile.name);
  };

  const handlePrimaryIdUploadSuccess = (
    _fileId: string,
    data: DocumentUploadResponse,
  ) => {
    setFormData((prev) => ({ ...prev, primaryId: data }));
  };

  const handlePrimaryIdUploadError = (_fileId: string, error: any) => {
    console.error("Primary ID upload failed:", error);
    showErrorToast(t("uploadError"));
  };

  const handlePrimaryIdRemoved = (_fileId: string) => {
    setFormData((prev) => ({ ...prev, primaryId: null }));
  };

  const handleSecondaryIdUploadStart = (uploadedFile: File) => {
    console.log("Secondary ID upload started:", uploadedFile.name);
  };

  const handleSecondaryIdUploadSuccess = (
    _fileId: string,
    data: DocumentUploadResponse,
  ) => {
    setFormData((prev) => ({
      ...prev,
      secondaryId: data,
      documentType: selectedDocumentType,
    }));
  };

  const handleSecondaryIdUploadError = (_fileId: string, error: any) => {
    console.error("Secondary ID upload failed:", error);
    showErrorToast(t("uploadError"));
  };

  const handleSecondaryIdRemoved = (_fileId: string) => {
    setFormData((prev) => ({ ...prev, secondaryId: null, documentType: null }));
    setSelectedDocumentType(null);
  };

  const handleProofOfAddressUploadStart = (uploadedFile: File) => {
    console.log("Proof of address upload started:", uploadedFile.name);
  };

  const handleProofOfAddressUploadSuccess = (
    _fileId: string,
    data: DocumentUploadResponse,
  ) => {
    setFormData((prev) => ({ ...prev, proofOfAddressDocument: data }));
  };

  const handleProofOfAddressUploadError = (_fileId: string, error: any) => {
    console.error("Proof of address upload failed:", error);
    showErrorToast(t("uploadError"));
  };

  const handleProofOfAddressRemoved = (_fileId: string) => {
    setFormData((prev) => ({ ...prev, proofOfAddressDocument: null }));
  };

  const handleProofOfAddressTypeChange = (
    type: "ghana_post_code" | "utility_bill" | "bank_statement",
  ) => {
    setFormData((prev) => ({
      ...prev,
      proofOfAddressType: type,
      ghanaPostCode: "",
      proofOfAddressDocument: null,
    }));
  };

  const handleSubmit = async (formSubmissionData: IdDocumentFormData) => {
    const nowIso = new Date().toISOString();
    const growerLocalDocuments = [];

    if (formData.primaryId) {
      growerLocalDocuments.push({
        file_url: formData.primaryId.downloadUrl,
        file_type: 0,
        file_name: "identity",
        uploaded_date: nowIso,
      });
    }

    if (formData.secondaryId) {
      growerLocalDocuments.push({
        file_url: formData.secondaryId.downloadUrl,
        file_type: 0,
        file_name: "secondary_identity",
        uploaded_date: nowIso,
      });
    }

    if (
      formData.proofOfAddressDocument &&
      (formData.proofOfAddressType === "utility_bill" ||
        formData.proofOfAddressType === "bank_statement")
    ) {
      growerLocalDocuments.push({
        file_url: formData.proofOfAddressDocument.downloadUrl,
        file_type: 0,
        file_name: "proof_of_address",
        uploaded_date: nowIso,
      });
    }

    draftMutation.mutate({
      body: {
        userId: userId ?? "",
        kycStatus: "Draft",
        submittedDate: nowIso,
        kycType: "GrowerLocal",
        details: {
          grower_local: {
            postal_code: formSubmissionData.ghanaPostCode ?? "00000",
            passport_expire_date: formSubmissionData.expirationDate ?? null,
            proof_of_address_type: formData.proofOfAddressType ?? null,
          },
          grower_intl: {},
        } as any,
        documents: {
          corp_identity: [],
          finance: [],
          auth_rep: [],
          grower_local_documents: growerLocalDocuments,
          grower_intl_documents: [],
        } as any,
      },
    });

    setFormData((prev) => ({
      ...prev,
      expirationDate: formSubmissionData.expirationDate,
      ghanaPostCode: formSubmissionData.ghanaPostCode,
    }));
  };

  const ghanaPostCode = watch("ghanaPostCode");

  const isFormValid =
    formData.primaryId !== null &&
    expirationDate !== "" &&
    formData.proofOfAddressType !== null &&
    ((formData.proofOfAddressType === "ghana_post_code" &&
      ghanaPostCode.trim() !== "") ||
      ((formData.proofOfAddressType === "utility_bill" ||
        formData.proofOfAddressType === "bank_statement") &&
        formData.proofOfAddressDocument !== null));

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col items-center justify-center px-1 py-2 md:px-4">
        <div className="w-full max-w-lg space-y-8 md:max-w-4xl lg:max-w-2xl">
          <div className="space-y-3 text-left md:text-center">
            <p className="text-muted-foreground text-sm">{t("uploadSub")}</p>
          </div>

          <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-8">
            <DocumentUploadSection
              title={t("residentType.uploadId")}
              formData={{
                primaryId: formData.primaryId,
                secondaryId: formData.secondaryId,
                proofOfAddressDocument: formData.proofOfAddressDocument,
                visaDocument: null,
                passportDocument: null,
              }}
              uploadFunction={async (
                file: File,
                onProgress: (progress: number) => void,
              ) => {
                return uploadFunction(file, onProgress);
              }}
              onUploadStart={handlePrimaryIdUploadStart}
              onUploadSuccess={handlePrimaryIdUploadSuccess}
              onUploadError={handlePrimaryIdUploadError}
              onFileRemoved={handlePrimaryIdRemoved}
              documentKey="primaryId"
            />

            <DocumentUploadSection
              title={t("residentType.uploadPassport")}
              formData={{
                primaryId: formData.primaryId,
                secondaryId: formData.secondaryId,
                proofOfAddressDocument: formData.proofOfAddressDocument,
                visaDocument: null,
                passportDocument: null,
              }}
              uploadFunction={async (
                file: File,
                onProgress: (progress: number) => void,
              ) => {
                return uploadFunction(file, onProgress);
              }}
              onUploadStart={handleSecondaryIdUploadStart}
              onUploadSuccess={handleSecondaryIdUploadSuccess}
              onUploadError={handleSecondaryIdUploadError}
              onFileRemoved={handleSecondaryIdRemoved}
              documentKey="secondaryId"
            />

            <div className="space-y-4">
              <p className=" !mb-0 text-sm font-semibold">
                {t("residentType.expiryDate")}
              </p>

              <FormDateInput
                name="expirationDate"
                control={control}
                className="border-input-border  w-3/4 xl:w-1/2"
              />
            </div>

            <ProofOfAddressSection
              formData={{
                proofOfAddressType: formData.proofOfAddressType,
                ghanaPostCode: formData.ghanaPostCode,
                proofOfAddressDocument: formData.proofOfAddressDocument,
              }}
              uploadFunction={async (
                file: File,
                onProgress: (progress: number) => void,
              ) => {
                return uploadFunction(file, onProgress);
              }}
              onProofTypeChange={handleProofOfAddressTypeChange}
              onUploadStart={handleProofOfAddressUploadStart}
              onUploadSuccess={handleProofOfAddressUploadSuccess}
              onUploadError={handleProofOfAddressUploadError}
              onFileRemoved={handleProofOfAddressRemoved}
            />

            <div className="flex justify-center">
              <div className="flex w-full flex-col items-center gap-4">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark w-3/4 items-center justify-center rounded-xl text-white"
                  size="lg"
                  disabled={
                    !isValid ||
                    draftMutation.isPending ||
                    isSubmitting ||
                    !isFormValid
                  }
                >
                  {draftMutation.isPending ? t("submit") : t("save")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
