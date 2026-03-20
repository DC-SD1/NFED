"use client";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FormField,
} from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type React from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";

import { FileUpload } from "@/components/file-upload";
import { useKycDocumentUpload } from "@/hooks/use-kyc-document-upload";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast } from "@/lib/utils/toast";

const certificationSchema = z.object({
  type: z.string().min(1, "Select a certification type"),
  document: z.custom<DocumentUploadResponse>(),
});
type KycCertificationFormData = z.infer<typeof certificationSchema>;

export const KycCertificationForm: React.FC = () => {
  const { onOpen, onClose } = useModal();
  const router = useRouter();
  const { uploadFunction } = useKycDocumentUpload();
  const api = useApiClient();
  const t = useTranslations("dashboard.kyc");
  const { userId } = useAuthUser();

  const submitMutation = api.useMutation("post", "/kyc/draft", {
    onSuccess: () => {
      onOpen("Success", {
        successTitle: t("successTitle"),
        successDescription: t("successSub"),
        primaryButton: {
          label: "Done",
          variant: "default",
          onClick: () => {
            onClose();
            router.push("/profile");
          },
        },
      });
    },
    onError: () => {
      showErrorToast("Failed to submit KYC information. Please try again.");
    },
  });

  const { data: detailsData } = api.useQuery("get", "/kyc/get-details", {
    params: { query: { UserId: userId } },
  });

  const { data: documentsData } = api.useQuery("get", "/kyc/get-documents", {
    params: { query: { UserId: userId } },
  });

  const methods = useForm<KycCertificationFormData>({
    resolver: zodResolver(certificationSchema),
    mode: "onChange",
    defaultValues: {
      type: "",
      document: undefined,
    },
  });

  const handleFormSubmit = async (data: KycCertificationFormData) => {
    const isLocal = !!(detailsData as any)?.details?.grower_local
      ?.proof_of_address_type;

    const kycType = isLocal ? "GrowerLocal" : "GrowerInternational";

    submitMutation.mutate({
      body: {
        userId: userId!,
        kycStatus: "Draft",
        submittedDate: new Date().toISOString(),
        kycType,
        details: (detailsData as any)?.details,
        documents: (documentsData as any)?.documents,
        certification: {
          file_url: data.document?.downloadUrl,
          file_type: 0,
          file_name: "certification",
          upload_date: data.document?.uploadedAt,
          certification: { value: data.type },
        },
      } as any,
    });
  };

  const handlePrimaryIdUploadStart = (uploadedFile: File) => {
    console.log("Primary ID upload started:", uploadedFile.name);
  };

  const handlePrimaryIdUploadSuccess = (
    _fileId: string,
    data: DocumentUploadResponse,
  ) => {
    methods.setValue("document", data);
  };

  const handlePrimaryIdUploadError = (_fileId: string, error: any) => {
    console.error("Primary ID upload failed:", error);
    showErrorToast(t("uploadError"));
  };

  const handlePrimaryIdRemoved = (_fileId: string) => {
    methods.setValue("document", undefined as any);
  };

  const certificationOptions = [
    { label: t("certification.options.pprsd"), value: "PPRSD" },
    { label: t("certification.options.globalGap"), value: "GlobalGAP" },
    { label: t("certification.options.euOrganic"), value: "EUOrganic" },
    { label: t("certification.options.asta"), value: "ASTA" },
    { label: t("certification.options.smeta"), value: "SMETA" },
    { label: t("certification.options.fairTrade"), value: "FairTrade" },
  ];

  const hasSelectedType = methods.watch("type");

  const formDocument = methods.watch("document");
  const formType = methods.watch("type");

  const isFormValid = formDocument && formType;

  const initialFiles = formDocument
    ? [
        {
          id: formDocument?.id,
          name: formDocument?.filename,
          size: formDocument?.size,
          type: formDocument?.type,
          progress: 100,
          status: "success" as const,
          data: undefined,
        },
      ]
    : [];

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleFormSubmit)}
        className="space-y-8"
      >
        <div className="space-y-4">
          <p className="text-md mb-8 text-start text-muted-foreground lg:text-center">
            {t("certification.description")}
          </p>
        </div>

        <FormField
          control={methods.control}
          name="type"
          render={({ field }) => (
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-between rounded-lg border border-input-border bg-userDropdown-background p-3 text-sm text-input-placeholder"
                  >
                    <span
                      className={
                        field.value ? "text-black" : "text-input-placeholder"
                      }
                    >
                      {field.value || t("certification.selectPlaceholder")}
                    </span>
                    <ChevronDown className="ml-2 size-5 shrink-0 text-black" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto rounded-2xl border-none bg-white p-3 shadow-xl"
                >
                  {certificationOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => field.onChange(option.value)}
                      className="hover:none mb-2 cursor-pointer rounded-xl bg-userDropdown-background p-3 "
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        />

        {hasSelectedType && (
          <div className="space-y-2">
            <p className="!mb-0 text-sm font-semibold">
              {t("certification.uploadLabel")}
            </p>

            <FileUpload<DocumentUploadResponse>
              maxFiles={1}
              allowedTypes={["pdf", "jpg", "jpeg", "png"]}
              initialFiles={initialFiles}
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
              iconColor="text-primary"
              dropzoneProps={{
                title: "Upload",
                description:
                  "Format accepted jpeg, png and PDF and file size max 2 MB",
              }}
            />
          </div>
        )}

        <div className="flex justify-center">
          <div className="flex w-full flex-col items-center gap-4">
            <Button
              type="submit"
              className="w-3/4 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark"
              size="lg"
              disabled={!isFormValid || submitMutation.isPending}
            >
              {submitMutation.isPending ? t("submit") : t("save")}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
