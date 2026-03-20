"use client";

import { Button, Form } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { type Locale, useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormUpload } from "@/components/form-upload";
import { useBuyerDocumentUpload } from "@/lib/hooks/use-buyer-document-upload";
import { useKycDocumentStatus } from "@/lib/hooks/use-kyc-document-status";
import { useKycResubmissionTracker } from "@/lib/hooks/use-kyc-resubmission-tracker";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useBuyerDocumentUploadStore } from "@/lib/stores/upload-store";

const CORPORATE_DOCUMENT_ID_MAP = {
  businessIncorporationDocs: "corporate_identity",
  proofOfBusinessAddress: "proof_of_business_address",
  corporateProfileOrBrochure: "corporate_profile_or_brochure",
} as const;

type CorporateFieldName = keyof typeof CORPORATE_DOCUMENT_ID_MAP;

const CORPORATE_FIELDS: readonly CorporateFieldName[] = Object.keys(CORPORATE_DOCUMENT_ID_MAP) as CorporateFieldName[];

const hasPersistedValue = (value: string | string[] | undefined): boolean => {
  if (typeof value === "string") {
    return value.trim() !== "";
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return false;
};

type CorporateFieldValueMap = Partial<Record<CorporateFieldName, string | string[] | undefined>>;

const ensureCorporateUploadsTracked = (
  data: CorporateFieldValueMap,
  isFieldUploaded: (fieldName: CorporateFieldName) => boolean,
  markFieldUploaded: (fieldName: CorporateFieldName, documentId: string) => void,
) => {
  CORPORATE_FIELDS.forEach((fieldName) => {
    if (hasPersistedValue(data[fieldName]) && !isFieldUploaded(fieldName)) {
      markFieldUploaded(fieldName, CORPORATE_DOCUMENT_ID_MAP[fieldName]);
    }
  });
};

const corporateIdentitySchema = z.object({
  businessIncorporationDocs: z
    .string()
    .min(1, "buyerOnboarding.corporateIdentity.validation.selectAtLeastOneBusinessDoc")
    .refine((val) => val.trim() !== "", {
      message: "buyerOnboarding.corporateIdentity.validation.selectAtLeastOneBusinessDoc",
    }),
  proofOfBusinessAddress: z.string().optional(),
  corporateProfileOrBrochure: z.string().optional(),
});

type CorporateIdentityFormSchema = z.infer<typeof corporateIdentitySchema>;

export function CorporateIdentityForm() {
  const t = useTranslations() as any;
  const { corporateIdentity, setCorporateIdentity } = useOnboardingStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;

  // Use nuqs for type-safe kycId management
  const [kycId] = useQueryState(
    "kycId",
    parseAsString.withDefault("")
  );

  // Check if we're in a resubmission flow (has kycId query parameter)
  const isResubmissionFlow = !!kycId && kycId.trim() !== "";

  // Upload functionality
  const { uploadFunction } = useBuyerDocumentUpload();
  const {
    file: uploadedFile,
    uploadResponse: _uploadResponse,
    setFile,
    setUploadResponse,
    updateFileProgress,
    updateFileStatus,
  } = useBuyerDocumentUploadStore();

  // Get KYC document status for resubmission - only call when we have a valid kycId
  const { corporateIdentity: docStatus, isPending: isKycLoading } = useKycDocumentStatus(
    isResubmissionFlow ? kycId : null
  );

  // Track resubmissions
  const { markFieldUploaded, clearFieldUploaded, markFieldUploading, clearFieldUploading, isFieldUploaded } = useKycResubmissionTracker();

  const form = useForm<CorporateIdentityFormSchema>({
    resolver: zodResolver(
      corporateIdentitySchema.extend({
        businessIncorporationDocs: corporateIdentitySchema.shape.businessIncorporationDocs.refine(
          (val) => val.trim() !== "",
          {
            message: t(
              "buyerOnboarding.corporateIdentity.validation.selectAtLeastOneBusinessDoc",
            ),
          },
        ),
      }),
    ),
    defaultValues: corporateIdentity,
    mode: "onTouched", // Only show errors after field is touched/blurred
  });

  const isUploading = uploadedFile?.status === "uploading";

  // Compute button states based on actual field values from store
  const isRequiredFileUploaded =
    !!corporateIdentity.businessIncorporationDocs &&
    corporateIdentity.businessIncorporationDocs.trim() !== "";
  const canSubmit = isRequiredFileUploaded && !isUploading;

  // Rehydrate form values from persisted store on page refresh/navigation
  useEffect(() => {
    // Avoid clobbering user edits and avoid loops by only resetting when values actually differ
    const currentValues = form.getValues();
    const valuesChanged =
      JSON.stringify(currentValues) !== JSON.stringify(corporateIdentity);
    if (!form.formState.isDirty && valuesChanged) {
      isHydratingRef.current = true;
      form.reset(corporateIdentity);
      // allow subscribers to run, then re-enable store syncing
      setTimeout(() => {
        isHydratingRef.current = false;
      }, 0);
    }
  }, [corporateIdentity, form]);

  // Prevent feedback loop: skip store update while hydrating/resetting
  const isHydratingRef = useRef(false);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (isHydratingRef.current) return;
      setCorporateIdentity(value as CorporateIdentityFormSchema);

      CORPORATE_FIELDS.forEach((fieldName) => {
        const fieldValue = value[fieldName];
        if (!hasPersistedValue(fieldValue)) {
          clearFieldUploaded(fieldName);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setCorporateIdentity, clearFieldUploaded]);

  useEffect(() => {
    if (isResubmissionFlow) {
      ensureCorporateUploadsTracked(
        corporateIdentity as CorporateFieldValueMap,
        (fieldName) => isFieldUploaded(fieldName),
        (fieldName, documentId) => markFieldUploaded(fieldName, documentId),
      );
    }
  }, [corporateIdentity, isResubmissionFlow, isFieldUploaded, markFieldUploaded]);

  const onSubmit: SubmitHandler<CorporateIdentityFormSchema> = async (data: CorporateIdentityFormSchema) => {
    setCorporateIdentity(data);

    if (isResubmissionFlow) {
      ensureCorporateUploadsTracked(
        data,
        (fieldName) => isFieldUploaded(fieldName),
        (fieldName, documentId) => markFieldUploaded(fieldName, documentId),
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // If we're in a resubmission flow, redirect back to review page
    if (isResubmissionFlow) {
      router.push(`/${locale}/onboarding/review/${kycId}`);
    } else {
      // Normal onboarding flow - continue to next step
      router.push(
        `/${locale}/onboarding/company-documents/authorized-representative`,
      );
    }
  };

  // Upload handlers factory
  const createUploadHandlers = (fieldName: CorporateFieldName) => ({
    onUploadStart: (uploadedFile: File) => {
      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        progress: 0,
        status: "uploading",
      });
      markFieldUploading(fieldName);
    },
    onUploadProgress: (_fileId: string, progress: number) => {
      updateFileProgress(progress);
    },
    onUploadSuccess: async (_fileId: string, data: any) => {
      updateFileStatus("success");
      setUploadResponse(data);

      // Mark field as uploaded when file is uploaded
      // Map field names to document IDs for tracking
      const documentId = CORPORATE_DOCUMENT_ID_MAP[fieldName];
      if (documentId) {
        markFieldUploaded(fieldName, documentId);
      }

      clearFieldUploading(fieldName);

      // FormUpload component already sets the form value with shouldValidate: true
      // Wait for validation to complete
      await form.trigger(fieldName);
      await form.trigger(); // Trigger validation for all fields
    },
    onUploadError: (_fileId: string, error: string) => {
      updateFileStatus("error", error);
      clearFieldUploading(fieldName);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormUpload
          name="businessIncorporationDocs"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          disabled={isKycLoading || docStatus.businessIncorporationDocs.disabled}
          isCompleted={docStatus.businessIncorporationDocs.disabled}
          className="w-full"
          label={t("buyerOnboarding.corporateIdentity.label")}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers("businessIncorporationDocs")}
          dropzoneProps={{
            description: docStatus.businessIncorporationDocs.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.corporateIdentity.labelDescription"),
            className: docStatus.businessIncorporationDocs.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.businessIncorporationDocs.isAccepted ? docStatus.businessIncorporationDocs.filename : undefined
          }}
        />

        <FormUpload
          name="proofOfBusinessAddress"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          disabled={isKycLoading || docStatus.proofOfBusinessAddress.disabled}
          isCompleted={docStatus.proofOfBusinessAddress.disabled}
          className="w-full"
          label={t("buyerOnboarding.corporateIdentity.proofOfBusinessAddress")}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers("proofOfBusinessAddress")}
          dropzoneProps={{
            description: docStatus.proofOfBusinessAddress.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.corporateIdentity.labelDescription"),
            className: docStatus.proofOfBusinessAddress.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.proofOfBusinessAddress.isAccepted ? docStatus.proofOfBusinessAddress.filename : undefined
          }}
        />

        <FormUpload
          name="corporateProfileOrBrochure"
          accept={{
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpeg"],
            "image/png": [".png"],
          }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          disabled={isKycLoading || docStatus.corporateProfileOrBrochure.disabled}
          isCompleted={docStatus.corporateProfileOrBrochure.disabled}
          className="w-full"
          label={t(
            "buyerOnboarding.corporateIdentity.corporateProfileOrBrochure",
          )}
          uploadFunction={uploadFunction}
          messages={{
            fileTooLarge: t("common.errors.field_too_large"),
            tooManyFiles: t("common.errors.invalid_value"),
            fileInvalidType: t("common.errors.invalid_format"),
          }}
          {...createUploadHandlers("corporateProfileOrBrochure")}
          dropzoneProps={{
            description: docStatus.corporateProfileOrBrochure.isAccepted
              ? "Uploaded"
              : t("buyerOnboarding.corporateIdentity.labelDescription"),
            className: docStatus.corporateProfileOrBrochure.isAccepted
              ? "border-gray-300 border-dashed bg-gray-50"
              : "border-[#6F7978]",
            title: docStatus.corporateProfileOrBrochure.isAccepted ? docStatus.corporateProfileOrBrochure.filename : undefined
          }}
        />

        <div className="inset-x-0 bottom-0 z-50 flex flex-col-reverse justify-end gap-4 bg-white p-4 md:fixed md:flex-row lg:static lg:bg-transparent lg:p-0 lg:shadow-none">
          <Button
            type="button"
            variant="ghost"
            className="text-primary w-full bg-transparent px-12 font-bold hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] lg:w-auto lg:bg-[#F5F5F5] lg:text-[hsl(var(--text-dark))]"
            asChild
          >
            <Link href={isResubmissionFlow ? `/${locale}/onboarding/review/${kycId}` : "/onboarding/basic-information/crop-interest"}>
              {t("buyerOnboarding.corporateIdentity.back")}
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full font-bold lg:w-48"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t("buyerOnboarding.corporateIdentity.saveAndContinue")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
