"use client";

import { useApiClient } from "@/lib/api/client";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { logger } from "@/lib/utils/logger";

export function useFarmDocumentUpload() {
  const api = useApiClient();

  const uploadFunction = async (
    file: File,
    farmName: string,
    onProgress: (progress: number) => void,
  ): Promise<DocumentUploadResponse> => {
    try {
      // Farm name validation is handled by the form component
      // which has access to translations

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const allowedTypes = ["pdf", "png", "jpg", "jpeg"];

      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        throw new Error(
          `Unsupported file type: ${fileExtension}. Please upload a PDF, PNG, or JPEG file.`,
        );
      }

      logger.info("Starting farm document upload", {
        fileName: file.name,
        farmName,
      });

      onProgress(10);

      if (file.size === 0) {
        throw new Error(
          `File "${file.name}" is empty. Please select a file with content.`,
        );
      }

      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSizeInBytes) {
        throw new Error(
          `File "${file.name}" is too large. Maximum file size is 10MB.`,
        );
      }

      logger.info("File details", {
        name: file.name,
        size: file.size,
        type: file.type,
        farmName,
      });

      onProgress(30);

      const response = await api.client.POST("/upload/farm-documents", {
        body: {
          file: file as any,
          farmName,
        },
        bodySerializer(body) {
          const fd = new FormData();
          for (const name in body) {
            fd.append(name, (body as any)[name]);
          }
          return fd;
        },
      });

      onProgress(70);

      if (response.error) {
        const errorDetails = response.error as any;
        const firstError = errorDetails.errors?.[0];
        throw new Error(firstError?.message || "Farm document upload failed");
      }

      if (!response.data) {
        throw new Error("No data returned from farm document upload");
      }

      onProgress(100);
      logger.info("Farm document upload successful", {
        fileName: file.name,
        farmName,
      });

      // Parse the JSON string response
      return {
        id: `farm-document-${new Date().getTime()}`,
        filename: file.name,
        downloadUrl: response.data,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Farm document upload failed", error);
      throw error;
    }
  };

  return {
    uploadFunction,
  };
}
