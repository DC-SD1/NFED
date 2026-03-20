/**
 * Upload Error Handler Utility
 * Maps error codes to localized error details (title, description)
 */

export interface UploadErrorDetails {
  titleKey: string; // Translation key for error title (relative to errorModal scope)
  descriptionKey: string; // Translation key for error description (relative to errorModal scope)
  overrideSubtitle?: boolean; // Whether to override the backend message with a custom subtitle
  subtitleKey?: string; // Translation key for custom subtitle (optional)
}

/**
 * Maps error codes to translation keys for error modal
 * Keys are relative to "FarmLands.upload.errorModal" namespace
 * @param errorCode - The error code from the backend
 * @returns Error details with translation keys
 */
export function getUploadErrorDetails(errorCode?: string): UploadErrorDetails {
  if (!errorCode) {
    return {
      titleKey: "default.title",
      descriptionKey: "default.description",
    };
  }

  // Map error codes to translation keys (relative to FarmLands.upload.errorModal)
  const errorMap: Record<string, UploadErrorDetails> = {
    // CSV Errors
    INVALID_CSV: {
      titleKey: "invalidCsv.title",
      descriptionKey: "invalidCsv.description",
    },
    INVALID_CSV_FORMAT: {
      titleKey: "invalidCsv.title",
      descriptionKey: "invalidCsv.description",
    },
    CSV_MISSING_COLUMNS: {
      titleKey: "missingColumns.title",
      descriptionKey: "missingColumns.csvDescription",
    },
    CSV_INVALID_DATA: {
      titleKey: "invalidData.title",
      descriptionKey: "invalidData.description",
    },

    // Excel Errors
    INVALID_XLSX: {
      titleKey: "invalidXlsx.title",
      descriptionKey: "invalidXlsx.description",
    },
    INVALID_XLSX_FORMAT: {
      titleKey: "invalidXlsx.title",
      descriptionKey: "invalidXlsx.description",
    },
    XLSX_MISSING_COLUMNS: {
      titleKey: "missingColumns.title",
      descriptionKey: "missingColumns.xlsxDescription",
    },
    XLSX_INVALID_DATA: {
      titleKey: "invalidData.title",
      descriptionKey: "invalidData.description",
    },

    // KML Errors
    INVALID_KML: {
      titleKey: "invalidKml.title",
      descriptionKey: "invalidKml.description",
    },
    INVALID_KML_FORMAT: {
      titleKey: "invalidKml.title",
      descriptionKey: "invalidKml.description",
    },
    KML_INVALID_STRUCTURE: {
      titleKey: "invalidKml.title",
      descriptionKey: "invalidKml.description",
    },

    // Coordinate Errors
    INVALID_COORDINATES: {
      titleKey: "invalidCoordinates.title",
      descriptionKey: "invalidCoordinates.description",
    },
    INVALID_COORDINATES_GEOMETRY: {
      titleKey: "invalidCoordinates.title",
      descriptionKey: "invalidCoordinates.description",
    },
    COORDINATES_OUT_OF_BOUNDS: {
      titleKey: "invalidCoordinates.title",
      descriptionKey: "invalidCoordinates.description",
    },
    POLYGON_NOT_CLOSED: {
      titleKey: "polygonNotClosed.title",
      descriptionKey: "polygonNotClosed.description",
    },
    INSUFFICIENT_POINTS: {
      titleKey: "insufficientPoints.title",
      descriptionKey: "insufficientPoints.description",
    },

    // File Errors
    FILE_EMPTY: {
      titleKey: "fileEmpty.title",
      descriptionKey: "fileEmpty.description",
      overrideSubtitle: true,
      subtitleKey: "fileEmpty.subtitle",
    },
    FILE_TOO_LARGE: {
      titleKey: "fileTooLarge.title",
      descriptionKey: "fileTooLarge.description",
    },
  };

  // Return mapped error details or default
  return (
    errorMap[errorCode] ?? {
      titleKey: "default.title",
      descriptionKey: "default.description",
    }
  );
}
