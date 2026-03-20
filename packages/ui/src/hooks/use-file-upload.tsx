"use client";

import type { components } from "@cf/api";
import { useCallback, useState } from "react";

interface UploadErrorWithDetails {
  code?: string;
  localizedMessage?: string;
  errors?: components["schemas"]["SharedKernelError"][];
}

function isUploadErrorWithDetails(
  error: unknown,
): error is UploadErrorWithDetails {
  return (
    typeof error === "object" &&
    error !== null &&
    ("code" in error || "localizedMessage" in error || "errors" in error)
  );
}

export interface UploadFile<T = unknown> {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  errorMessage?: string;
  errorCode?: string;
  localizedMessage?: string;
  errors?: components["schemas"]["SharedKernelError"][];
  data?: T;
  originalFile?: File;
}

export interface UseFileUploadOptions<T = unknown> {
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  initialFiles?: UploadFile<T>[]; // Initial files to display
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  onUploadSuccess?: (fileId: string, data: T) => void;
  onUploadError?: (fileId: string, error: string) => void;
  onFilesChange?: (files: UploadFile<T>[]) => void;
  uploadFunction?: (
    file: File,
    onProgress: (progress: number) => void,
  ) => Promise<T>;
}

export function useFileUpload<T = unknown>(
  options: UseFileUploadOptions<T> = {},
) {
  const {
    maxFiles = 1,
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    initialFiles = [],
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onFilesChange,
    uploadFunction,
  } = options;

  const [files, setFiles] = useState<UploadFile<T>[]>(initialFiles);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
      }

      if (allowedTypes.length > 0) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          return `Only ${allowedTypes.join(", ").toUpperCase()} files are allowed`;
        }
      }

      return null;
    },
    [maxSize, allowedTypes],
  );

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      const filesToAdd = newFiles.slice(0, maxFiles - files.length);

      for (const file of filesToAdd) {
        const validationError = validateFile(file);
        if (validationError) {
          alert(validationError);
          continue;
        }

        const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const uploadFile: UploadFile<T> = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: "uploading",
          originalFile: file, // Store the original File object for retry functionality
        };

        setFiles((prev) => {
          const newFiles = [...prev, uploadFile];
          onFilesChange?.(newFiles);
          return newFiles;
        });
        onUploadStart?.(file);

        try {
          if (uploadFunction) {
            const data = await uploadFunction(file, (progress) => {
              setFiles((prev) => {
                const newFiles = prev.map((f) =>
                  f.id === fileId ? { ...f, progress } : f,
                );
                onFilesChange?.(newFiles);
                return newFiles;
              });
              onUploadProgress?.(fileId, progress);
            });

            setFiles((prev) => {
              const newFiles = prev.map((f) =>
                f.id === fileId
                  ? { ...f, status: "success" as const, data }
                  : f,
              );
              onFilesChange?.(newFiles);
              return newFiles;
            });
            onUploadSuccess?.(fileId, data);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";

          let errorCode: string | undefined;
          let localizedMessage: string | undefined;
          let errors: components["schemas"]["SharedKernelError"][] | undefined;

          if (isUploadErrorWithDetails(error)) {
            errorCode = error.code;
            localizedMessage = error.localizedMessage;
            errors = error.errors;
          }

          setFiles((prev) => {
            const newFiles = prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "error" as const,
                    errorMessage,
                    errorCode,
                    localizedMessage,
                    errors,
                  }
                : f,
            );
            onFilesChange?.(newFiles);
            return newFiles;
          });
          onUploadError?.(fileId, errorMessage);
        }
      }
    },
    [
      files.length,
      maxFiles,
      validateFile,
      uploadFunction,
      onUploadStart,
      onUploadProgress,
      onUploadSuccess,
      onUploadError,
      onFilesChange,
    ],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const newFiles = prev.filter((f) => f.id !== fileId);
        onFilesChange?.(newFiles);
        return newFiles;
      });
    },
    [onFilesChange],
  );

  const clearFiles = useCallback(() => {
    setFiles([]);
    onFilesChange?.([]);
  }, [onFilesChange]);

  const retryUpload = useCallback(
    async (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (!file || !uploadFunction) return;

      setFiles((prev) => {
        const newFiles = prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "uploading" as const,
                progress: 0,
                errorMessage: undefined,
              }
            : f,
        );
        onFilesChange?.(newFiles);
        return newFiles;
      });

      try {
        // Use the original file for retry, or create a fallback if not available
        const fileToUpload =
          file.originalFile ?? new File([""], file.name, { type: file.type });

        // If no original file is available, this is likely an error condition
        if (!file.originalFile) {
          throw new Error(
            "Original file not available for retry. Please select the file again.",
          );
        }

        const data = await uploadFunction(fileToUpload, (progress) => {
          setFiles((prev) => {
            const newFiles = prev.map((f) =>
              f.id === fileId ? { ...f, progress } : f,
            );
            onFilesChange?.(newFiles);
            return newFiles;
          });
          onUploadProgress?.(fileId, progress);
        });

        setFiles((prev) => {
          const newFiles = prev.map((f) =>
            f.id === fileId ? { ...f, status: "success" as const, data } : f,
          );
          onFilesChange?.(newFiles);
          return newFiles;
        });
        onUploadSuccess?.(fileId, data);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";

        let errorCode: string | undefined;
        let localizedMessage: string | undefined;
        let errors: components["schemas"]["SharedKernelError"][] | undefined;

        if (isUploadErrorWithDetails(error)) {
          errorCode = error.code;
          localizedMessage = error.localizedMessage;
          errors = error.errors;
        }

        setFiles((prev) => {
          const newFiles = prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error" as const,
                  errorMessage,
                  errorCode,
                  localizedMessage,
                  errors,
                }
              : f,
          );
          onFilesChange?.(newFiles);
          return newFiles;
        });
        onUploadError?.(fileId, errorMessage);
      }
    },
    [
      files,
      uploadFunction,
      onUploadProgress,
      onUploadSuccess,
      onUploadError,
      onFilesChange,
    ],
  );

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    retryUpload,
    canAddMore: files.length < maxFiles,
    hasFiles: files.length > 0,
    hasSuccessfulUploads: files.some((f) => f.status === "success"),
    hasErrors: files.some((f) => f.status === "error"),
    isUploading: files.some((f) => f.status === "uploading"),
  };
}
