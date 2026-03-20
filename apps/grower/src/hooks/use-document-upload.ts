"use client";

import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { logger } from "@/lib/utils/logger";

export function useDocumentUpload() {
  const uploadFunction = async (
    file: File,
    onProgress: (progress: number) => void,
  ): Promise<DocumentUploadResponse> => {
    try {
      // Validate file type
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const allowedTypes = ["pdf", "png", "jpg", "jpeg"];

      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        throw new Error(
          `Unsupported file type: ${fileExtension}. Please upload a PDF, PNG, or JPEG file.`,
        );
      }

      logger.info("Starting document upload", { fileName: file.name });

      onProgress(10);

      // Check if file is empty
      if (file.size === 0) {
        throw new Error(
          `File "${file.name}" is empty. Please select a file with content.`,
        );
      }

      // Check file size (max 10MB)
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

      // TODO: Replace with actual API endpoint when available
      // For now, we'll simulate an upload with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onProgress(60);

      await new Promise((resolve) => setTimeout(resolve, 500));
      onProgress(90);

      // Mock response - in real implementation, this would come from the API
      const mockResponse: DocumentUploadResponse = {
        id: `doc-${Date.now()}`,
        filename: file.name,
        downloadUrl: URL.createObjectURL(file), // Creating a local URL for preview
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };

      onProgress(100);
      logger.info("Document upload successful", { fileName: file.name });

      return mockResponse;
    } catch (error) {
      logger.error("Document upload failed", error);
      throw error;
    }
  };

  return {
    uploadFunction,
  };
}
