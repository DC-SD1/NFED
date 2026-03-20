"use client";

import type { UploadFile } from "@cf/ui";
import { Button, Card, cn, FileCard, useIsMobile } from "@cf/ui";
import { useCallback, useState } from "react";

import { formatFileSize } from "@/lib/utils/string-helpers";
import { showErrorToast } from "@/lib/utils/toast";

export interface SignatureUploadProps<T = unknown> {
  // File handling
  onFilesAdded?: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  onFileRetry?: (fileId: string) => void;
  onShowError?: (file: UploadFile<T>) => void;

  // Upload state
  files?: UploadFile<T>[];
  maxFiles?: number;
  maxSize?: number; // in bytes

  // UI customization
  title?: string;
  subtitle?: string;
  buttonText?: string;
  acceptedFormats?: string[];

  // Styling
  className?: string;
  dropzoneClassName?: string;
  fileListClassName?: string;

  // Behavior
  disabled?: boolean;
  showFileCards?: boolean;
}

export function SignatureUpload<T = unknown>({
  onFilesAdded,
  onFileRemove,
  onFileRetry,
  onShowError,
  files = [],
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB default
  title = "Drag & drop a signature image",
  subtitle = "Format accepted: PNG",
  buttonText = "Select image",
  acceptedFormats = ["image/png"],
  className = "",
  dropzoneClassName = "",
  fileListClassName = "",
  disabled = false,
  showFileCards = true,
}: SignatureUploadProps<T>) {
  const [isDragOver, setIsDragOver] = useState(false);
  const isMobile = useIsMobile();

  const validateAndProcessFiles = useCallback(
    (filesToCheck: File[]) => {
      const validFiles: File[] = [];
      const rejectedFiles: File[] = [];

      filesToCheck.forEach((file) => {
        if (
          acceptedFormats.length > 0 &&
          !acceptedFormats.includes(file.type)
        ) {
          rejectedFiles.push(file);
          showErrorToast(
            `File "${file.name}" is not of type ${acceptedFormats.join(", ")}.`,
          );
          return;
        }

        if (maxSize && file.size > maxSize) {
          rejectedFiles.push(file);
          showErrorToast(
            `File "${file.name}" (${formatFileSize(file.size)}) exceeds the maximum size limit of ${formatFileSize(maxSize)}.`,
          );
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        const filesToAdd = validFiles.slice(0, maxFiles - files.length);

        if (filesToAdd.length < validFiles.length) {
          showErrorToast("You can only upload up to " + maxFiles + " files.");
        }

        onFilesAdded?.(filesToAdd);
      }
    },
    [acceptedFormats, maxSize, maxFiles, files.length, onFilesAdded],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndProcessFiles(droppedFiles);
    },
    [disabled, validateAndProcessFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || !e.target.files) return;

      const selectedFiles = Array.from(e.target.files);
      validateAndProcessFiles(selectedFiles);

      // Reset input
      e.target.value = "";
    },
    [disabled, validateAndProcessFiles],
  );

  const canAddMore = files.length < maxFiles;
  const hasFiles = files.length > 0;

  return (
    <div className={cn("w-full", className)}>
      {/* Dropzone */}
      {(canAddMore || !hasFiles) && (
        <Card
          className={cn(
            "border-gray-dark bg-gray-light relative mb-6 justify-center rounded-lg border-2 border-dashed",
            isDragOver && !disabled && "border-primary",
            disabled && "cursor-not-allowed opacity-50",
            !disabled && "cursor-pointer ",
            dropzoneClassName,
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
            {/* Title */}
            <h3 className="text-md font-semibold ">{title}</h3>

            {/* Subtitle */}
            <p className="text-gray-dark text-md font-thin">{subtitle}</p>

            {/* Select Button */}
            <div className="relative">
              <input
                type="file"
                accept={acceptedFormats.join(",")}
                onChange={handleFileInput}
                disabled={disabled}
                className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                multiple={maxFiles > 1}
              />
              <Button
                variant="default"
                className="rounded-full px-4 font-semibold"
                disabled={disabled}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* File Cards */}
      {showFileCards && hasFiles && (
        <div className={cn("mt-4 space-y-2", fileListClassName)}>
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onRemove={onFileRemove}
              onRetry={onFileRetry}
              onShowError={
                onShowError as ((file: UploadFile<unknown>) => void) | undefined
              }
              isMobile={isMobile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
