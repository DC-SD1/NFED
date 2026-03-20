"use client";

import { Button } from "@cf/ui";
import { ChevronRight, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { FileUpload } from "@/components/file-upload";
import { useFarmLandsUpload } from "@/hooks/use-farm-lands-upload";
import type { FarmLandsUploadResponse } from "@/lib/stores/upload-store";
import { useFarmLandsUploadStore } from "@/lib/stores/upload-store";

export default function UploadFarmLandsPage() {
  const router = useRouter();
  const t = useTranslations("FarmLands.upload");
  // Pure upload function - no state
  const { uploadFunction } = useFarmLandsUpload();

  // Dedicated store for farm lands uploads - isolated from other upload types
  const {
    file,
    uploadResponse,
    setFile,
    setUploadResponse,
    updateFileStatus,
    updateFileProgress,
    resetUpload,
  } = useFarmLandsUploadStore();

  const [type] = useQueryState("type", parseAsString.withDefault("csv"));

  const fileType = ["csv", "kml"].includes(type) ? type : "csv";
  const allowedTypes = fileType === "csv" ? ["csv", "xlsx"] : ["kml"];
  const templateText =
    fileType === "csv" ? t("downloadTemplate.csv") : t("downloadTemplate.kml");

  const handleDownloadTemplate = () => {
    const templateUrl =
      fileType === "csv"
        ? "/templates/farm-coordinates-template.csv"
        : "/templates/farm-coordinates-template.kml";

    const link = document.createElement("a");
    link.href = templateUrl;
    link.download = `farm-coordinates-template.${fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadStart = (uploadedFile: File) => {
    // Store file info when upload starts
    setFile({
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
      progress: 0,
      status: "uploading",
    });
  };

  const handleUploadSuccess = (
    _fileId: string,
    data: FarmLandsUploadResponse,
  ) => {
    // Store the response in the dedicated farm lands store
    setUploadResponse(data);
    // Update file status and progress using dedicated store methods
    updateFileProgress(100);
    updateFileStatus("success");
  };

  const handleUploadError = (_fileId: string, error: any) => {
    console.error("Upload failed:", error);
    // Update file status with error details using dedicated store method
    const errorMessage =
      error?.localizedMessage ||
      (typeof error === "string" ? error : error.message) ||
      "Upload failed";
    updateFileStatus("error", errorMessage);
  };

  const handleFileRemoved = (_fileId: string) => {
    // Reset the upload store when a file is removed
    resetUpload();
  };

  return (
    <TopLeftHeaderLayout
      onBack={() => router.push("/farm-owner/farm-lands/add")}
      buttonClassName="md:px-4"
    >
      <div className="flex flex-col items-center justify-center px-1 py-2 md:px-4">
        <div className="w-full max-w-lg space-y-8 md:max-w-4xl lg:max-w-2xl">
          {/* Header */}
          <div className="space-y-3 text-left md:text-center">
            <h1 className="text-foreground text-3xl font-semibold leading-9">
              {t("title")}
            </h1>
            <p
              className="text-base"
              style={{ color: "hsl(var(--subtitle-text))" }}
            >
              {file?.status === "uploading"
                ? t("subtitle.uploading")
                : file?.status === "success"
                  ? t("subtitle.success")
                  : file?.status === "error"
                    ? t("subtitle.error")
                    : t("subtitle.default")}
            </p>
          </div>
          {/* Template info banner */}
          {type === "csv" && (
            <div className="bg-blue-light mb-8 rounded-lg border border-blue-200 p-4">
              <p className="text-blue-dark mb-2 text-sm">
                {fileType === "csv" ? t("infoBanner.csv") : t("infoBanner.kml")}
              </p>
              <Button
                variant="link"
                className="text-blue-dark h-auto p-0 font-bold"
                onClick={handleDownloadTemplate}
              >
                <Download className="mr-1 size-4" />
                {templateText}
              </Button>
            </div>
          )}
          {/* Reusable File Upload Component */}
          <div className="space-y-6">
            <FileUpload<FarmLandsUploadResponse>
              maxFiles={1}
              allowedTypes={allowedTypes}
              uploadFunction={uploadFunction}
              initialFiles={
                uploadResponse && file
                  ? [
                      {
                        id: `stored-${new Date().getTime().toString()}`,
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
              onUploadStart={handleUploadStart}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              onFileRemoved={handleFileRemoved}
              iconColor="text-primary"
              dropzoneProps={{
                title: t("dropzone.title"),
                description:
                  fileType === "csv"
                    ? t("dropzone.descriptionCsv")
                    : t("dropzone.descriptionKml"),
              }}
            />

            {/* Continue button */}
            <Button
              onClick={() =>
                router.push("/farm-owner/farm-lands/upload/confirm")
              }
              className="bg-primary hover:bg-primary-dark w-full items-center justify-center rounded-2xl text-white"
              size="lg"
              disabled={!uploadResponse}
            >
              {t("continue")}
              <ChevronRight className="size-8" />
            </Button>
          </div>
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
