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
  // const { onOpen } = useModal();
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
              onShowError={(_) => {
                // TODO: TO BE USED LATER
                // const errorFile = file as UploadFile<T>;
                //
                // // Extract error details from the file
                // const errorMessage =
                //   errorFile.errorMessage || "An error occurred during upload";
                // const errorCode = (errorFile as any).errorCode;
                // const localizedMessage = (errorFile as any).localizedMessage;
                //
                // // Determine error title and subtitle based on error code
                // let errorTitle = "Upload Error";
                // let errorSubtitle = localizedMessage || errorMessage;
                // let errorDescription = "Please check your file and try again.";
                //
                // // Customize messages based on error code
                // if (
                //   errorCode === "INVALID_CSV" ||
                //   errorCode === "INVALID_CSV_FORMAT"
                // ) {
                //   errorTitle = "Invalid CSV Format";
                //   errorDescription =
                //     "Please ensure your CSV file matches the template format.";
                // } else if (
                //   errorCode === "INVALID_KML" ||
                //   errorCode === "INVALID_KML_FORMAT"
                // ) {
                //   errorTitle = "Invalid KML Format";
                //   errorDescription =
                //     "Please ensure your KML file contains valid coordinates.";
                // } else if (
                //   errorCode === "INVALID_COORDINATES" ||
                //   errorCode === "COORDINATES_OUT_OF_BOUNDS"
                // ) {
                //   errorTitle = "Invalid Coordinates";
                //   errorDescription =
                //     "The coordinates in your file appear to be invalid or out of bounds.";
                // } else if (errorCode === "FILE_EMPTY") {
                //   errorTitle = "Empty File";
                //   errorSubtitle = "The uploaded file appears to be empty.";
                //   errorDescription = "Please select a file with content.";
                // } else if (errorCode === "CSV_MISSING_COLUMNS") {
                //   errorTitle = "Missing Required Columns";
                //   errorDescription =
                //     "Your CSV file is missing required columns. Please use the template.";
                // }
                // onOpen("Error", {
                //   errorTitle,
                //   errorSubtitle,
                //   errorDescription,
                //   primaryButton: {
                //     label: "Re-upload >",
                //     onClick: () => {
                //       retryUpload(errorFile.id).catch((error) => {
                //         console.error("Failed to retry upload:", error);
                //       });
                //     },
                //     variant: "default",
                //   },
                //   secondaryButton: {
                //     label: "Manually map the land",
                //     onClick: () => {
                //       onOpen("MobileAppPrompt");
                //     },
                //     variant: "link",
                //   },
                // });
              }}
              {...fileCardProps}
            />
          ))}
        </div>
      )}
    </div>
  );
}
