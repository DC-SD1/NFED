"use client";
import { Button, cn, Form } from "@cf/ui";
import { FormInput } from "@cf/ui/components/form-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FileUpload } from "@/components/file-upload";
import { useFarmDocumentUpload } from "@/hooks/use-farm-document-upload";
import { useFarmLandsForm } from "@/hooks/use-farm-lands-form";
import {
  type AdditionalDetailsFormData,
  additionalDetailsSchema,
} from "@/lib/schemas/farm-lands";
import type { LandOwnershipType } from "@/lib/stores/farm-lands-form-store";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { showErrorToast } from "@/lib/utils/toast";
interface AdditionalDetailsFormProps {
  onNext?: () => void;
}
// Radio option component
const RadioOption = ({
  value,
  label,
  checked,
  onChange,
}: {
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
}) => (
  <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-[#73796e] px-3 transition-colors hover:bg-[#f5f7f1] md:h-14 md:gap-4 md:px-4">
    <input
      type="radio"
      value={value}
      checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(value);
      }}
      onChange={() => undefined}
      className="accent-primary size-5 md:size-6"
    />
    <span className="text-foreground text-sm font-normal md:text-base">
      {label}
    </span>
  </label>
);
export function AdditionalDetailsForm({ onNext }: AdditionalDetailsFormProps) {
  const router = useRouter();
  const t = useTranslations("FarmLands.additionalDetails");
  const tValidation = useTranslations();
  // Document upload functionality
  const { uploadFunction } = useFarmDocumentUpload();
  // Use consolidated hook for all store selections
  const {
    // Upload store values
    uploadResponse,
    file,
    setUploadResponse,
    resetUpload,
    setFile,
    updateFileStatus,
    updateFileProgress,
    // Form store values
    farmName,
    region,
    village,
    landOwnershipType,
    documentUrl,
    setFormData,
    setLandOwnershipType,
    setDocumentUrl,
  } = useFarmLandsForm();
  const form = useForm<AdditionalDetailsFormData>({
    resolver: zodResolver(
      additionalDetailsSchema((key, values) => tValidation(key as any, values)),
    ),
    defaultValues: {
      farmName: farmName || "",
      region: region || "",
      village: village || "",
      landOwnershipType: landOwnershipType,
      documentUrl: documentUrl || null,
    },
    mode: "onChange",
  });
  const { control, handleSubmit, formState, setValue, watch } = form;
  const selectedLandOwnership = watch("landOwnershipType");
  // Check if file is uploading
  const isUploading = file?.status === "uploading";
  // Update document URL when upload succeeds
  useEffect(() => {
    if (uploadResponse) {
      const url = uploadResponse.downloadUrl;
      setDocumentUrl(url);
      setValue("documentUrl", url, { shouldValidate: true });
    }
  }, [uploadResponse, setDocumentUrl, setValue]);
  const handleFormSubmit = async (data: AdditionalDetailsFormData) => {
    // Save form data to store when submitting
    setFormData({
      farmName: data.farmName || "",
      region: data.region || "",
      village: data.village || "",
      landOwnershipType: data.landOwnershipType as LandOwnershipType,
      documentUrl: data.documentUrl || null,
    });
    if (onNext) {
      onNext();
    } else {
      router.push("/farm-owner/farm-lands/upload/confirmation");
    }
  };
  // Upload handlers grouped into single object
  const uploadHandlers = {
    onUploadStart: (uploadedFile: File) => {
      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type,
        progress: 0,
        status: "uploading",
      });
    },
    onUploadProgress: (_fileId: string, progress: number) => {
      updateFileProgress(progress);
    },
    onUploadSuccess: (_fileId: string, data: DocumentUploadResponse) => {
      updateFileStatus("success");
      setUploadResponse(data);
    },
    onUploadError: (_fileId: string, error: string) => {
      updateFileStatus("error", error);
    },
    onFileRemoved: (_fileId: string, _file: any) => {
      resetUpload();
      setDocumentUrl(null);
      setValue("documentUrl", null, { shouldValidate: true });
    },
  };
  const handleLandOwnershipChange = (value: string) => {
    // If clicking on already selected option, deselect it
    if (selectedLandOwnership === value) {
      setValue("landOwnershipType", null, { shouldValidate: true });
      setLandOwnershipType(null);
      // Clear document upload when deselecting
      if (uploadResponse || documentUrl) {
        resetUpload();
        setDocumentUrl(null);
        setValue("documentUrl", null, { shouldValidate: true });
      }
    } else {
      // Select new ownership type
      const ownership = value as LandOwnershipType;
      setValue("landOwnershipType", ownership, { shouldValidate: true });
      setLandOwnershipType(ownership);
      // Reset document upload if changing ownership type
      if (uploadResponse || documentUrl) {
        resetUpload();
        setDocumentUrl(null);
        setValue("documentUrl", null, { shouldValidate: true });
      }
    }
  };
  // Common FormInput props
  const formInputProps = {
    control,
    containerClassName: "space-y-1.5 md:space-y-0.5",
    className:
      "border-input-border h-12 rounded-xl border border-solid md:h-14",
    labelClassName:
      "text-sm font-semibold text-foreground  placeholder:text-input-placeholder",
  };
  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="w-full space-y-4 md:space-y-6"
      >
        {/* Farm name */}
        <FormInput
          {...formInputProps}
          name="farmName"
          label={t("farmName")}
          placeholder={t("farmNamePlaceholder")}
        />
        {/* Region */}
        <FormInput
          {...formInputProps}
          name="region"
          label={t("region")}
          placeholder={t("regionPlaceholder")}
        />
        {/* Village/Location */}
        <FormInput
          {...formInputProps}
          name="village"
          label={t("villageLocation")}
          placeholder={t("villagePlaceholder")}
        />
        {/* Land ownership type */}
        <div className="space-y-3">
          <p className="text-foreground text-sm font-normal md:text-base">
            {t("landOwnershipType")}
          </p>
          <RadioOption
            value="LandTitle"
            label={t("landTitle")}
            checked={selectedLandOwnership === "LandTitle"}
            onChange={handleLandOwnershipChange}
          />
          <RadioOption
            value="ContractualAgreements"
            label={t("contractualAgreements")}
            checked={selectedLandOwnership === "ContractualAgreements"}
            onChange={handleLandOwnershipChange}
          />
        </div>
        {/* Document upload - shown when land ownership is selected */}
        {selectedLandOwnership && (
          <div className="space-y-1.5">
            <p className="text-foreground text-sm font-semibold">
              {selectedLandOwnership === "LandTitle"
                ? t("uploadLandTitle")
                : t("uploadContractual")}
            </p>
            <FileUpload<DocumentUploadResponse>
              maxFiles={1}
              allowedTypes={["pdf", "png", "jpg", "jpeg"]}
              uploadFunction={async (file, onProgress) => {
                const currentFarmName = form.getValues("farmName");
                if (!currentFarmName?.trim()) {
                  showErrorToast(t("farmNameRequiredForUpload"));
                  throw new Error(t("farmNameRequiredForUpload"));
                }
                return uploadFunction(file, currentFarmName, onProgress);
              }}
              initialFiles={
                uploadResponse && file
                  ? [
                      {
                        id: `stored-${Date.now()}`,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        progress: 100,
                        status: "success" as const,
                        data: uploadResponse,
                      },
                    ]
                  : []
              }
              {...uploadHandlers}
              iconColor="text-primary"
              dropzoneProps={{
                title: t("uploadLabel"),
                description: t("uploadDescription"),
                className: "border-dashed bg-white",
              }}
            />
          </div>
        )}
        {/* Next button */}
        <Button
          type="submit"
          disabled={!formState.isValid || isUploading}
          className={cn(
            "bg-primary hover:bg-primary/90 mt-6 h-12 w-full rounded-2xl text-white md:mt-8 md:h-14",
            (!formState.isValid || isUploading) &&
              "cursor-not-allowed opacity-40",
          )}
          size="lg"
        >
          {isUploading ? t("uploading") : t("next")}
          <ChevronRight className="size-5 md:size-6" />
        </Button>
      </form>
    </Form>
  );
}
