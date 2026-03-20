"use client";

import { FileCard, type FileCardProps } from "@cf/ui/components/file-card";
import {
  FileDropzone,
  type FileDropzoneProps,
} from "@cf/ui/components/file-dropzone";
import {
  type UploadFile,
  useFileUpload,
  type UseFileUploadOptions,
} from "@cf/ui/hooks/use-file-upload";
import { useTranslations } from "next-intl";

import { useModal } from "@/lib/stores/use-modal";
import { getUploadErrorDetails } from "@/lib/utils/upload-error-handler";

export interface UploadProps<T = unknown>
  extends Omit<
    UseFileUploadOptions<T>,
    "onUploadStart" | "onUploadProgress" | "onUploadSuccess" | "onUploadError"
  > {
  // Dropzone props
  dropzoneProps?: Partial<FileDropzoneProps>;

  // File card props
  fileCardProps?: Partial<FileCardProps>;

  // Icon styling
  iconColor?: string;

  // Layout options
  layout?: "vertical" | "horizontal" | "grid";
  showDropzoneWhenHasFiles?: boolean;

  // Event handlers
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  onUploadSuccess?: (fileId: string, data: T) => void;
  onUploadError?: (fileId: string, error: string) => void;
  onFilesChange?: (files: UploadFile<T>[]) => void;
  onFileRemoved?: (fileId: string, file: UploadFile<T>) => void;

  // Styling
  className?: string;
  dropzoneClassName?: string;
  fileListClassName?: string;
}

export function FileUpload<T = unknown>({
  maxFiles = 1,
  maxSize,
  allowedTypes = [],
  initialFiles,
  uploadFunction,
  dropzoneProps = {},
  fileCardProps = {},
  iconColor,
  layout = "vertical",
  showDropzoneWhenHasFiles = false,
  onUploadStart,
  onUploadProgress,
  onUploadSuccess,
  onUploadError,
  onFilesChange,
  onFileRemoved,
  className = "",
  dropzoneClassName = "",
  fileListClassName = "",
}: UploadProps<T>) {
  const { onOpen } = useModal();
  const t = useTranslations("FarmLands.upload.errorModal");
  const {
    files,
    addFiles,
    removeFile,
    clearFiles: _clearFiles,
    retryUpload,
    canAddMore,
    hasFiles,
  } = useFileUpload<T>({
    maxFiles,
    maxSize,
    allowedTypes,
    initialFiles,
    uploadFunction,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess: (fileId, data) => {
      onUploadSuccess?.(fileId, data);
    },
    onUploadError: (fileId, error) => {
      onUploadError?.(fileId, error);
    },
    onFilesChange,
  });

  const handleFileRemove = (fileId: string) => {
    const fileToRemove = files.find((f) => f.id === fileId);
    if (fileToRemove) {
      onFileRemoved?.(fileId, fileToRemove);
    }
    removeFile(fileId);
  };

  const showDropzone = !hasFiles || showDropzoneWhenHasFiles;

  const getLayoutClasses = () => {
    switch (layout) {
      case "horizontal":
        return "flex flex-row space-x-4";
      case "grid":
        return "grid grid-cols-1 md:grid-cols-2 gap-4";
      default:
        return "space-y-4";
    }
  };

  return (
    <div className={`${className}`}>
      {showDropzone && canAddMore && (
        <FileDropzone
          onFilesAdded={addFiles}
          accept={
            allowedTypes.length > 0
              ? allowedTypes.reduce(
                  (acc, type) => {
                    if (type === "csv") {
                      acc["text/csv"] = [".csv"];
                      // acc["application/vnd.ms-excel"] = [".csv"];
                    } else if (type === "xlsx") {
                      acc[
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      ] = [".xlsx"];
                      acc["application/vnd.ms-excel"] = [".xlsx"];
                    } else if (type === "kml") {
                      acc["application/vnd.google-earth.kml+xml"] = [".kml"];
                    } else {
                      acc[`application/${type}`] = [`.${type}`];
                    }
                    return acc;
                  },
                  {} as Record<string, string[]>,
                )
              : undefined
          }
          maxFiles={maxFiles}
          maxSize={maxSize}
          className={dropzoneClassName}
          iconColor={iconColor}
          {...dropzoneProps}
        />
      )}

      {hasFiles && (
        <div
          className={`${getLayoutClasses()} ${fileListClassName} ${showDropzone ? "mt-4" : ""}`}
        >
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onRemove={handleFileRemove}
              onRetry={retryUpload}
              onShowError={(file) => {
                const errorFile = file as UploadFile<T>;

                // Extract error details from the file
                const errorCode = errorFile.errorCode;
                const localizedMessage = errorFile.localizedMessage;
                const backendErrors = errorFile.errors;
                const errorMessage =
                  errorFile.errorMessage || "An error occurred during upload";

                // Get error details (title, description keys) based on error code
                const errorDetails = getUploadErrorDetails(errorCode);

                // Prioritize backend error message over generic one
                const displayMessage =
                  localizedMessage ||
                  (backendErrors && backendErrors.length > 0
                    ? backendErrors[0]?.message
                    : null) ||
                  errorMessage;

                // Get localized error title and description
                const errorTitle = t(errorDetails.titleKey as any);
                const errorDescription = t(errorDetails.descriptionKey as any);

                // Use custom subtitle if specified, otherwise use backend message
                const errorSubtitle = errorDetails.overrideSubtitle
                  ? t(errorDetails.subtitleKey as any)
                  : displayMessage;

                onOpen("Error", {
                  errorTitle,
                  errorSubtitle,
                  errorDescription,
                  primaryButton: {
                    label: "Re-upload >",
                    onClick: () => {
                      retryUpload(errorFile.id).catch((error) => {
                        console.error("Failed to retry upload:", error);
                      });
                    },
                    variant: "default",
                  },
                  secondaryButton: {
                    label: "Manually map the land",
                    onClick: () => {
                      onOpen("MobileAppPrompt");
                    },
                    variant: "link",
                  },
                });
              }}
              {...fileCardProps}
            />
          ))}
        </div>
      )}
    </div>
  );
}
