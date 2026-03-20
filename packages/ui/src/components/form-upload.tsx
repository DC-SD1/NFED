"use client";

import { IconFileText, IconTrash } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import type { DropzoneOptions } from "react-dropzone";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "./button";
import { FileDropzone, type FileDropzoneProps } from "./file-dropzone";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

// Generic type for upload response
export interface UploadResponse {
  id: string;
  filename: string;
  downloadUrl: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// Props interface for FormUpload component
export interface FormUploadProps<T = UploadResponse> {
  name: string;
  accept?: DropzoneOptions["accept"];
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  label: string;
  description?: string;
  labelDescription?: string;
  messages?: {
    fileTooLarge?: string;
    tooManyFiles?: string;
    fileInvalidType?: string;
  };

  // Upload configuration
  allowedTypes?: string[];
  uploadFunction?: (
    file: File,
    onProgress: (progress: number) => void,
  ) => Promise<T>;

  // Event handlers
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  onUploadSuccess?: (fileId: string, data: T) => void;
  onUploadError?: (fileId: string, error: string) => void;

  // Dropzone styling
  iconColor?: string;
  dropzoneProps?: Partial<FileDropzoneProps>;
}

export function FormUpload<T = UploadResponse>({
  name,
  accept,
  maxFiles = 1,
  maxSize,
  disabled = false,
  className = "",
  label,
  description,
  allowedTypes = ["pdf", "png", "jpg", "jpeg"],
  uploadFunction,
  onUploadStart,
  onUploadProgress,
  onUploadSuccess,
  onUploadError,
  iconColor = "text-primary",
  dropzoneProps = {},
  messages,
}: FormUploadProps<T>) {
  const { setValue, setError, clearErrors, control, trigger } =
    useFormContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Watch current value for this field so we can show persisted file info
  const currentValue = useWatch({ control, name }) as unknown as
    | string
    | undefined;

  const existingFileDisplayName = useMemo(() => {
    if (!currentValue || typeof currentValue !== "string") return "";
    try {
      const url = new URL(currentValue);
      const pathname = url.pathname ?? "";
      const last = pathname.split("/").filter(Boolean).pop();
      return last ?? "Uploaded file";
    } catch {
      const parts = currentValue.split("/");
      return parts.pop() ?? "Uploaded file";
    }
  }, [currentValue]);

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setValue(name, "", { shouldValidate: true });
    void trigger(name);
  };

  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || !uploadFunction) return;

      const file = files[0];
      if (!file) return;

      setIsUploading(true);
      setUploadedFile(file);

      try {
        // clear any previous validation error for this field
        clearErrors(name);
        onUploadStart?.(file);

        const response = await uploadFunction(file, (progress) => {
          onUploadProgress?.(`upload-${Date.now()}`, progress);
        });

        // Update the form field with the upload response
        const uploadValue =
          (response as UploadResponse)?.downloadUrl ?? response;
        setValue(name, uploadValue, { shouldValidate: true });
        void trigger(name);
        onUploadSuccess?.(`upload-${Date.now()}`, response);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        onUploadError?.(`upload-${Date.now()}`, errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [
      uploadFunction,
      onUploadStart,
      onUploadProgress,
      onUploadSuccess,
      onUploadError,
      setValue,
      name,
      trigger,
      clearErrors,
    ],
  );

  // Create accept object from allowedTypes
  const acceptObject =
    allowedTypes.length > 0
      ? allowedTypes.reduce(
          (acc, type) => {
            if (type === "pdf") {
              acc["application/pdf"] = [`.${type}`];
            } else if (["png", "jpg", "jpeg"].includes(type)) {
              acc[`image/${type === "jpg" ? "jpeg" : type}`] = [`.${type}`];
            }
            return acc;
          },
          {} as Record<string, string[]>,
        )
      : accept;

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <FileDropzone
                onFilesAdded={handleFilesAdded}
                onRejected={(rejections) => {
                  const first = rejections?.[0];
                  if (!first) return;
                  const codes = first.errors.map((e) => e.code);
                  let message: string | undefined;
                  if (codes.includes("file-too-large")) {
                    message =
                      messages?.fileTooLarge ??
                      "File is too large. Max size exceeded.";
                  } else if (codes.includes("too-many-files")) {
                    message = messages?.tooManyFiles ?? "Too many files.";
                  } else if (codes.includes("file-invalid-type")) {
                    message = messages?.fileInvalidType ?? "Invalid file type.";
                  } else if (first.errors[0]?.message) {
                    message = first.errors[0].message;
                  }
                  if (message) {
                    setError(name, { type: "manual", message });
                  }
                }}
                accept={acceptObject}
                maxFiles={maxFiles}
                maxSize={maxSize}
                disabled={disabled || isUploading}
                iconColor={iconColor}
                title={dropzoneProps.title ?? "Upload file"}
                description={
                  isUploading
                    ? "Uploading..."
                    : dropzoneProps.description ??
                      "Drag and drop or click to select"
                }
                {...dropzoneProps}
                className={dropzoneProps.className}
              />
              {(uploadedFile ?? (!!currentValue && !isUploading)) && (
                <div className="bg-[#F5F5F5] rounded-md p-2.5">
                  <div className="text-sm text-[#161D1D] font-semibold flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <IconFileText />
                      <div className="text-sm space-y-1">
                        <p>
                          {uploadedFile
                            ? uploadedFile.name
                            : existingFileDisplayName}
                        </p>
                        <p className="text-xs text-[#71786C]">
                          Uploaded successfully
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#161D1D] hover:text-[#161D1D] p-1 h-auto hover:bg-transparent"
                      onClick={handleRemoveFile}
                    >
                      <IconTrash className="!size-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
