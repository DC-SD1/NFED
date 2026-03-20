"use client";

import type { MultiPolygon, Polygon } from "geojson";
import { useTranslations } from "next-intl";

import { useApiClient } from "@/lib/api";
import type { FarmLandsUploadResponse } from "@/lib/stores/upload-store";
import {
  extractErrorMessage,
  mapErrorToLocaleKey,
} from "@/lib/utils/error-mapper";
import { logger } from "@/lib/utils/logger";

export function useFarmLandsUpload() {
  const api = useApiClient();
  const t = useTranslations("FarmLands.upload");

  const uploadFunction = async (
    file: File,
    onProgress: (progress: number) => void,
  ): Promise<FarmLandsUploadResponse> => {
    try {
      // Determine file type from extension
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const isKmlFile = fileExtension === "kml";
      const isCsvFile = fileExtension === "csv";
      const isXlsxFile = fileExtension === "xlsx";

      if (!isKmlFile && !isCsvFile && !isXlsxFile) {
        throw new Error(
          `Unsupported file type: ${fileExtension}. Please upload a KML, CSV, or XLSX file.`,
        );
      }

      const fileType = isKmlFile ? "KML" : isCsvFile ? "CSV" : "XLSX";
      logger.info(`Starting ${fileType} file upload`, { fileName: file.name });

      onProgress(10);
      onProgress(30);

      // Check if file is empty
      if (file.size === 0) {
        throw new Error(
          `File "${file.name}" is empty. Please select a file with content.`,
        );
      }

      logger.info("File details", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Configure endpoint and field name based on file type
      const endpoint = isKmlFile
        ? "/farms/parse-kml"
        : isXlsxFile
          ? "/farms/parse-excel"
          : "/farms/parse-csv";
      const fieldName = isKmlFile
        ? "kmlFile"
        : isXlsxFile
          ? "excelFile"
          : "csvFile";

      const response = await api.client.POST(endpoint, {
        body: {
          [fieldName]: file as any, // Type assertion needed because OpenAPI schema expects string
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
        const errorDetails = response.error;
        const firstError = errorDetails.errors?.[0];

        // Create an error object with code and message
        const error = new Error(
          firstError?.message || `${fileType} upload failed`,
        ) as any;
        error.code = firstError?.code;
        error.errors = errorDetails.errors;

        // Try to get a localized error message
        const localeKey = mapErrorToLocaleKey(error);

        // If we have a specific upload error key, use it
        let localizedMessage: string;
        if (localeKey.startsWith("upload.errors.")) {
          // Extract just the error key name since we're already in FarmLands.upload
          const errorKey = localeKey.split(".").pop(); // Gets the last part e.g., "invalid_csv"
          localizedMessage = t(`errors.${errorKey}` as any);
        } else {
          // Fall back to extracting the message
          localizedMessage = extractErrorMessage(error);
        }

        error.localizedMessage = localizedMessage;

        logger.error(`${fileType} upload error`, {
          code: firstError?.code,
          message: firstError?.message,
          localizedMessage,
        });

        throw error;
      }

      if (!response.data) {
        throw new Error(`No data returned from ${fileType} upload`);
      }

      onProgress(100);
      logger.info(`${fileType} upload successful`, { fileName: file.name });

      // Transform the generic API response to your specific format
      const apiData = response.data;
      const transformedData: FarmLandsUploadResponse = {
        type: apiData.type || "Feature",
        geometry: apiData.geometry as Polygon | MultiPolygon,
        properties: {
          // Extract specific properties from the generic properties object
          name: (apiData.properties?.name as string) || "",
          description: (apiData.properties?.description as string) || "",
          centroidLongitude:
            (apiData.properties?.centroidLongitude as number) || 0,
          centroidLatitude:
            (apiData.properties?.centroidLatitude as number) || 0,
          areaSquareMeters:
            (apiData.properties?.areaSquareMeters as number) || 0,
          areaAcres: (apiData.properties?.areaAcres as number) || 0,
          // areaAcres: squareMetersToAcres((apiData.properties?.areaSquareMeters as number) || 0),
          pointCount: (apiData.properties?.pointCount as number) || 0,
        },
      };

      return transformedData;
    } catch (error) {
      logger.error("File upload failed", error);
      throw error;
    }
  };

  return {
    uploadFunction,
    // Keep the individual functions for backward compatibility if needed
    uploadKmlFile: (file: File, onProgress: (progress: number) => void) =>
      uploadFunction(file, onProgress),
    uploadCsvFile: (file: File, onProgress: (progress: number) => void) =>
      uploadFunction(file, onProgress),
  };
}
