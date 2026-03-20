import type { components } from "@cf/api";

// API DTO type
export type LearningResourceDto =
  components["schemas"]["ContentModuleApplicationDTOsLearningResourceDto"];

// Document type enum
export type LearningResourceType = "Video" | "Pdf";

// Base interface for all learning resources
export interface BaseLearningResource {
  id: string;
  title: string;
  description?: string | null;
  resourceUrl: string;
  thumbnailUrl?: string | null;
  hasUserViewed: boolean;
  isActive: boolean;
  createdAt: string;
}

// Video-specific resource
export interface VideoResource extends BaseLearningResource {
  type: "Video";
  durationSeconds?: number | null;
  displayDuration: string;
  youtubeId: string | null;
}

// Document-specific resource (PDF)
export interface DocumentResource extends BaseLearningResource {
  type: "Pdf";
  fileSizeBytes: number;
  formattedFileSize: string;
}

// Discriminated union type
export type LearningResource = VideoResource | DocumentResource;

// Type guards
export function isVideoResource(
  resource: LearningResource,
): resource is VideoResource {
  return resource.type === "Video";
}

export function isDocumentResource(
  resource: LearningResource,
): resource is DocumentResource {
  return resource.type === "Pdf";
}

// Validation functions
export function isValidVideoDto(dto: LearningResourceDto): boolean {
  // Videos should not have fileSizeBytes, can have videoDurationSeconds
  return dto.documentType === "Video" && !dto.fileSizeBytes;
}

export function isValidPdfDto(dto: LearningResourceDto): boolean {
  // PDFs must have fileSizeBytes, cannot have videoDurationSeconds
  return (
    dto.documentType === "Pdf" &&
    !!dto.fileSizeBytes &&
    !dto.videoDurationSeconds
  );
}
