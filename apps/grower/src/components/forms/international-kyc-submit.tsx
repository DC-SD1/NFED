"use client";

import { Button } from "@cf/ui";
import { FormDateInput } from "@cf/ui/components/form-date-time";
import { zodResolver } from "@hookform/resolvers/zod";
import { parse } from "date-fns";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useKycDocumentUpload } from "@/hooks/use-kyc-document-upload";
import { useApiClient } from "@/lib/api";
import { internationalIdDocumentSchema } from "@/lib/schemas/farm-manager-details";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { convertFileType } from "@/lib/utils";
import { showErrorToast } from "@/lib/utils/toast";

import { ProofOfAddressSection } from "../dashboard/uploads/address-proof";
import { DocumentUploadSection } from "../dashboard/uploads/document-upload";

// Updated interface for the new form data structure
export interface InternationalIdDocumentFormData {
  passportDocument: DocumentUploadResponse | null;
  passportExpirationDate: string;
  visaDocument: DocumentUploadResponse | null;
  visaExpirationDate: string;
  proofOfAddressType:
    | "ghana_post_code"
    | "utility_bill"
    | "bank_statement"
    | null;
  ghanaPostCode: string;
  proofOfAddressDocument: DocumentUploadResponse | null;
}

export default function InternationalIdDocumentUploadForm() {
  const router = useRouter();
  const t = useTranslations("dashboard.kyc"); // Assuming translations are in the same file
  const { uploadFunction } = useKycDocumentUpload();
  const api = useApiClient();
  const { userId: authUserId } = useAuthUser();

  const methods = useForm<InternationalIdDocumentFormData>({
    resolver: zodResolver(internationalIdDocumentSchema), // Use the new schema
    defaultValues: {
      passportExpirationDate: "",
      visaExpirationDate: "",
      ghanaPostCode: "",
    },
  });

  const { control, handleSubmit: handleFormSubmit, watch } = methods;

  const passportExpirationDate = watch("passportExpirationDate");
  const visaExpirationDate = watch("visaExpirationDate");
  const ghanaPostCode = watch("ghanaPostCode");

  const [formData, setFormData] = useState<InternationalIdDocumentFormData>({
    passportDocument: null,
    passportExpirationDate: "",
    visaDocument: null,
    visaExpirationDate: "",
    proofOfAddressType: null,
    ghanaPostCode: "",
    proofOfAddressDocument: null,
  });

  // Handlers for Passport Upload
  const handlePassportUploadSuccess = (
    _fileId: string,
    data: DocumentUploadResponse,
  ) => {
    setFormData((prev) => ({ ...prev, passportDocument: data }));
  };
  const handlePassportUploadError = (_fileId: string, error: any) => {
    console.error("Passport upload failed:", error);
    showErrorToast(t("uploadError"));
  };
  const handlePassportRemoved = (_fileId: string) => {
    setFormData((prev) => ({ ...prev, passportDocument: null }));
  };

  // Handlers for Visa Upload
  const handleVisaUploadSuccess = (
    _fileId: string,
    data: DocumentUploadResponse,
  ) => {
    setFormData((prev) => ({ ...prev, visaDocument: data }));
  };
  const handleVisaUploadError = (_fileId: string, error: any) => {
    console.error("Visa upload failed:", error);
    showErrorToast(t("uploadError"));
  };
  const handleVisaRemoved = (_fileId: string) => {
    setFormData((prev) => ({ ...prev, visaDocument: null }));
  };

  // Handlers for Proof of Address (unchanged)
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

  const handleProofOfAddressUploadStart = (uploadedFile: File) => {
    console.log("Proof of address upload started:", uploadedFile.name);
  };

  const draftMutation = api.useMutation("post", "/kyc/draft", {
    onSuccess: () => {
      router.push("/farm-owner/kyc/certification");
    },
  });

  const handleSubmit = (
    formSubmissionData: InternationalIdDocumentFormData,
  ) => {
    // Combine state with react-hook-form data for submission
    const finalData = { ...formData, ...formSubmissionData };
    const now = new Date().toISOString();
    const docsToSubmit = [
      {
        file_url: finalData.passportDocument?.downloadUrl,
        file_type: convertFileType(finalData.passportDocument?.type ?? ""),
        file_name: "passport",
        uploaded_date: now,
      },
      {
        file_url: finalData.visaDocument?.downloadUrl,
        file_type: convertFileType(finalData.visaDocument?.type ?? ""),
        file_name: "visa",
        uploaded_date: now,
      },
    ];

    if (finalData.proofOfAddressDocument?.id) {
      docsToSubmit.push({
        file_url: finalData.proofOfAddressDocument?.downloadUrl,
        file_type: convertFileType(
          finalData.proofOfAddressDocument?.type ?? "",
        ),
        file_name: "proof_of_address",
        uploaded_date: now,
      });
    }

    draftMutation.mutate({
      body: {
        userId: authUserId ?? "",
        submittedDate: now,
        kycType: "GrowerInternational",
        kycStatus: "Draft",
        details: {
          grower_intl: {
            passport_expire_date: parse(
              finalData.passportExpirationDate,
              "dd/MM/yyyy",
              new Date(),
            ),
            visa_expire_date: parse(
              finalData.visaExpirationDate,
              "dd/MM/yyyy",
              new Date(),
            ),
            proof_of_address_type: finalData.proofOfAddressType,
            postal_code:
              finalData.ghanaPostCode === ""
                ? "00000"
                : finalData.ghanaPostCode,
          },
        } as any,
        documents: {
          corp_identity: [],
          finance: [],
          grower_intl_documents: docsToSubmit,
        } as any,
      },
    });
  };

  // Updated validation logic for the submit button
  const isFormValid =
    formData.passportDocument !== null &&
    passportExpirationDate !== "" &&
    formData.visaDocument !== null &&
    visaExpirationDate !== "" &&
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
            <p className="text-sm text-muted-foreground">{t("uploadSub")}</p>
          </div>

          <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-8">
            {/* Passport Upload Section */}
            <DocumentUploadSection
              title={t("international.uploadPassport")}
              formData={{
                ...formData,
                primaryId: null,
                secondaryId: null,
              }}
              uploadFunction={async (
                file: File,
                onProgress: (progress: number) => void,
              ) => {
                return uploadFunction(file, onProgress);
              }}
              onUploadSuccess={handlePassportUploadSuccess}
              onUploadStart={handleProofOfAddressUploadStart}
              onUploadError={handlePassportUploadError}
              onFileRemoved={handlePassportRemoved}
              documentKey="passportDocument"
            />
            <div className="space-y-4">
              <p className=" !mb-0 text-sm font-semibold">
                {t("international.passExpiry")}
              </p>
              <FormDateInput
                name="passportExpirationDate"
                control={control}
                className="w-3/4 border-input-border xl:w-1/2"
              />
            </div>

            {/* Visa Upload Section */}
            <DocumentUploadSection
              title={t("international.uploadVisa")}
              formData={{
                ...formData,
                primaryId: null,
                secondaryId: null,
              }}
              uploadFunction={async (
                file: File,
                onProgress: (progress: number) => void,
              ) => {
                return uploadFunction(file, onProgress);
              }}
              onUploadSuccess={handleVisaUploadSuccess}
              onUploadStart={handleProofOfAddressUploadStart}
              onUploadError={handleVisaUploadError}
              onFileRemoved={handleVisaRemoved}
              documentKey="visaDocument"
            />
            <div className="space-y-4">
              <p className=" !mb-0 text-sm font-semibold">
                {t("international.visaExpiry")}
              </p>
              <FormDateInput
                name="visaExpirationDate"
                control={control}
                className="w-3/4 border-input-border xl:w-1/2"
              />
            </div>

            {/* Proof of Address Section (Unchanged) */}
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
                  className="w-3/4 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark"
                  size="lg"
                  disabled={!isFormValid || draftMutation.isPending}
                >
                  {t("save")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
