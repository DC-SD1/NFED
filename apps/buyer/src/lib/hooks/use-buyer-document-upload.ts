"use client";

import { useApiClient } from "@/lib/api/client";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { logger } from "@/lib/utils/logger";

export function useBuyerDocumentUpload() {
  const api = useApiClient();

  const uploadFunction = async (
    file: File,
    onProgress: (progress: number) => void,
  ): Promise<DocumentUploadResponse> => {
    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const allowedTypes = ["pdf", "png", "jpg", "jpeg"];

      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        throw new Error(
          `Unsupported file type: ${fileExtension}. Please upload a PDF, PNG, or JPEG file.`,
        );
      }

      logger.info("Starting buyer document upload", {
        fileName: file.name,
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
      });

      onProgress(30);

      const response = await api.client.POST("/upload/kyc-documents", {
        body: {
          file: file as any,
          organizationName: "buyer-onboarding", // Required for KYC document uploads
        },
        bodySerializer(body) {
          const fd = new FormData();
          Object.keys(body).forEach((name) => {
            fd.append(name, (body as any)[name]);
          });
          return fd;
        },
      });

      onProgress(70);

      if (response.error) {
        const errorDetails = response.error as any;
        const firstError = errorDetails.errors?.[0];
        throw new Error(firstError?.message || "Buyer document upload failed");
      }

      if (!response.data) {
        throw new Error("No data returned from buyer document upload");
      }

      onProgress(100);
      logger.info("Buyer document upload successful", {
        fileName: file.name,
      });

      // Parse the JSON string response
      const formattedResponse: DocumentUploadResponse = {
        id: file.name,
        uploadedAt: new Date().toISOString(),
        filename: file.name,
        size: file.size,
        type: file.type,
        downloadUrl: response.data,
      };
      return formattedResponse;
    } catch (error) {
      logger.error("Buyer document upload failed", error);
      throw error;
    }
  };

  return {
    uploadFunction,
  };
}
