"use client";

import { Button, cn } from "@cf/ui";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui";
import { toast } from "@cf/ui/components/sonner";
import {
  IconCheck,
  IconFileText,
  IconTrash,
  IconTrashX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DropzoneOptions } from "react-dropzone";
import { useFormContext, useWatch } from "react-hook-form";

import { FileDropzone, type FileDropzoneProps } from "./file-dropzone";

const ProgressRing = ({ value = 0 }: { value?: number }) => {
  const size = 24;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <svg
      width={size}
      height={size}
      className="shrink-0"
      aria-label={`Uploading ${clamped}%`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#EEF1EE"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#2A7D6A"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};

//

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
  isCompleted?: boolean;
}

// eslint-disable-next-line max-lines-per-function
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
  isCompleted,
}: FormUploadProps<T>) {
  const { setValue, setError, clearErrors, control, trigger } =
    useFormContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Watch current value for this field so we can show persisted file info
  const currentValue = useWatch({ control, name }) as unknown as
    | string
    | string[]
    | undefined;

  // Keep a ref in sync with currentValue so callbacks can read without hooks
  const currentValueRef = useRef<string | string[] | undefined>(currentValue);
  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  const existingFileDisplayName = useMemo(() => {
    if (!currentValue) return "";
    if (Array.isArray(currentValue)) {
      return currentValue
        .map((val) => {
          try {
            const url = new URL(val);
            const pathname = url.pathname || "";
            const last = pathname.split("/").filter(Boolean).pop();
            return last || "Uploaded file";
          } catch {
            const parts = val.split("/");
            return parts.pop() || "Uploaded file";
          }
        })
        .join(", ");
    }
    try {
      const url = new URL(currentValue);
      const pathname = url.pathname || "";
      const last = pathname.split("/").filter(Boolean).pop();
      return last || "Uploaded file";
    } catch {
      const parts = currentValue.split("/");
      return parts.pop() || "Uploaded file";
    }
  }, [currentValue]);

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setValue(name, "", { shouldValidate: true });
    void trigger(name);
  };

  const handleRemoveMultiAt = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    const current = currentValueRef.current;
    const next: string[] = Array.isArray(current)
      ? current.filter((_, i) => i !== index)
      : [];
    setValue(name, next as unknown as any, { shouldValidate: true });
    void trigger(name);
  };

  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      if (files.length === 0 || !uploadFunction) return;

      // Single file mode: keep existing behavior
      if (maxFiles === 1) {
        const file = files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadedFile(file);

        try {
          clearErrors(name);
          onUploadStart?.(file);

          const response = await uploadFunction(file, (progress) => {
            setUploadProgress(progress);
            onUploadProgress?.(`upload-${Date.now()}`, progress);
          });

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
        return;
      }

      // Multi-file mode: append and render all
      setIsUploading(true);
      setUploadProgress(0);
      try {
        // Reset local preview list for this batch to avoid duplicates
        setUploadedFiles([]);
        const current = currentValueRef.current;
        const currentArray: string[] = Array.isArray(current)
          ? [...current]
          : current
            ? [current]
            : [];

        const spaceLeft = Math.max(0, (maxFiles ?? 1) - currentArray.length);
        const skippedDuplicates: string[] = [];

        // Build a set of existing filenames from persisted values for fast duplicate checks
        const existingFilenames = new Set<string>(
          currentArray.map((val) => {
            try {
              const url = new URL(val);
              const pathname = url.pathname || "";
              const last = pathname.split("/").filter(Boolean).pop();
              return last || val;
            } catch {
              const parts = val.split("/");
              return parts.pop() || val;
            }
          }),
        );

        // First, filter out duplicates by filename before uploading
        const nonDuplicateFiles = files.filter((file) => {
          if (existingFilenames.has(file.name)) {
            skippedDuplicates.push(file.name);
            return false;
          }
          return true;
        });

        // Respect remaining capacity
        const filesToProcess = nonDuplicateFiles.slice(0, spaceLeft);

        let hadAnySuccess = false;
        for (const file of filesToProcess) {
          setUploadedFiles((prev) => [...prev, file]);
          onUploadStart?.(file);
          const response = await uploadFunction(file, (progress) => {
            setUploadProgress(progress);
            onUploadProgress?.(`upload-${Date.now()}`, progress);
          });
          const downloadUrl =
            (response as UploadResponse)?.downloadUrl ??
            (response as unknown as string);
          // Skip if URL already exists to prevent duplicates
          if (!currentArray.includes(downloadUrl)) {
            const nextArray = [...currentArray, downloadUrl];
            currentArray.push(downloadUrl);
            setValue(name, nextArray as unknown as any, {
              shouldValidate: false,
              shouldDirty: true,
              shouldTouch: true,
            });
            currentValueRef.current = nextArray;
            hadAnySuccess = true;
          } else {
            // Track duplicates to inform the user later
            skippedDuplicates.push(file.name);
          }
          // Remove file from local preview after processing
          setUploadedFiles((prev) => prev.filter((f) => f !== file));
          onUploadSuccess?.(`upload-${Date.now()}`, response);
        }
        let didSetError = false;
        if (skippedDuplicates.length > 0 || filesToProcess.length === 0) {
          const uniqueNames = Array.from(new Set(skippedDuplicates));
          let message: string | undefined;
          if (uniqueNames.length > 0) {
            message =
              uniqueNames.length === 1
                ? `"${uniqueNames[0]}" wasn’t uploaded because it’s a duplicate.`
                : `${uniqueNames.length} files weren’t uploaded because they’re duplicates: ${uniqueNames.join(", ")}.`;
          } else if (spaceLeft === 0) {
            message = messages?.tooManyFiles ?? "Too many files.";
          }
          if (message) {
            setError(name, { type: "manual", message });
            toast.error(message);
            didSetError = true;
          }
        }
        if (!didSetError) {
          if (hadAnySuccess) {
            clearErrors(name);
          }
          void trigger(name);
        }
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
      maxFiles,
      messages?.tooManyFiles,
      setError,
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
          <FormLabel className={cn(isCompleted ? "text-[#161D1D]/50" : "")}>
            {label}
          </FormLabel>
          <FormControl>
            <div className="space-y-2">
              {maxFiles === 1 &&
              (uploadedFile || (!!currentValue && !isUploading)) ? (
                <div className="rounded-md border border-dashed border-[#6F7978] px-3 py-4">
                  <div className="flex items-center justify-between gap-2 text-sm text-[#161D1D]">
                    <div className="flex items-center gap-3">
                      {isUploading ? (
                        <ProgressRing value={uploadProgress} />
                      ) : (
                        <div className="flex size-6 items-center justify-center rounded-full bg-[hsl(var(--success))]">
                          <IconCheck className="size-4 text-white" />
                        </div>
                      )}
                      <div className="space-y-0 text-sm">
                        <p>
                          {uploadedFile
                            ? uploadedFile.name
                            : existingFileDisplayName}
                        </p>
                        <p className="text-xs text-[#71786C]">
                          {isUploading ? "Uploading..." : "Uploaded"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-auto min-h-8 w-8 rounded-full bg-[#F5F5F5] text-[#586665] hover:bg-[#F5F5F5] hover:text-[#586665]"
                      onClick={handleRemoveFile}
                    >
                      <IconTrashX className="!size-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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
                        message =
                          messages?.fileInvalidType ?? "Invalid file type.";
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
                    icon={isCompleted ? "completed" : "cloud-upload"}
                    title={dropzoneProps.title ?? "Upload file"}
                    description={
                      isUploading
                        ? "Uploading..."
                        : (dropzoneProps.description ??
                          "Drag and drop or click to select")
                    }
                    {...dropzoneProps}
                    className={dropzoneProps.className}
                  />
                  {maxFiles > 1 &&
                    (uploadedFiles.length > 0 ||
                      (!!currentValue && !isUploading)) && (
                      <div className="space-y-2">
                        {(Array.isArray(currentValue)
                          ? currentValue
                          : currentValue
                            ? [currentValue]
                            : []
                        ).map((val, idx) => {
                          let displayName = "Uploaded file";
                          try {
                            const url = new URL(val);
                            const pathname = url.pathname || "";
                            displayName =
                              pathname.split("/").filter(Boolean).pop() ||
                              displayName;
                          } catch {
                            const parts = val.split("/");
                            displayName = parts.pop() || displayName;
                          }
                          return (
                            <div
                              key={`persisted-${idx}`}
                              className="rounded-md bg-[#F5F5F5] p-2.5"
                            >
                              <div className="flex items-center justify-between gap-2 text-sm font-semibold text-[#161D1D]">
                                <div className="flex items-center gap-2">
                                  <IconFileText />
                                  <div className="space-y-1 text-sm">
                                    <p>{displayName}</p>
                                    <p className="text-xs text-[#71786C]">
                                      Uploaded
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-auto p-1 text-[#161D1D] hover:bg-transparent hover:text-[#161D1D]"
                                  onClick={() => handleRemoveMultiAt(idx)}
                                >
                                  <IconTrash className="!size-5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {uploadedFiles.map((file, idx) => (
                          <div
                            key={`local-${idx}`}
                            className="rounded-md bg-[#F5F5F5] p-2.5"
                          >
                            <div className="flex items-center justify-between gap-2 text-sm font-semibold text-[#161D1D]">
                              <div className="flex items-center gap-2">
                                <IconFileText />
                                <div className="space-y-1 text-sm">
                                  <p>{file.name}</p>
                                  <p className="text-xs text-[#71786C]">
                                    {isUploading ? "Uploading..." : "Uploaded"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-auto p-1 text-[#161D1D] hover:bg-transparent hover:text-[#161D1D]"
                                onClick={() =>
                                  setUploadedFiles((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  )
                                }
                              >
                                <IconTrash className="!size-5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </>
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
