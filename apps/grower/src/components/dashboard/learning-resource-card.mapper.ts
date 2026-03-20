import { logger } from "@/lib/utils/logger";
import { formatFileSize } from "@/lib/utils/string-helpers";
import { extractYouTubeVideoId, formatDuration } from "@/lib/utils/video";
import type {
  DocumentResource,
  LearningResource,
  LearningResourceDto,
  VideoResource,
} from "@/types/learning-resources";

/**
 * Transforms a learning resource DTO to a video resource view model
 */
function mapToVideoResource(dto: LearningResourceDto): VideoResource | null {
  // Validate video business rules
  if (dto.documentType !== "Video" || dto.fileSizeBytes) {
    logger.warn(
      `Invalid video resource: ${dto.id} - has fileSizeBytes or wrong type`,
      {
        id: dto.id,
        documentType: dto.documentType,
        hasFileSizeBytes: !!dto.fileSizeBytes,
      },
    );
    return null;
  }

  const youtubeId = extractYouTubeVideoId(dto.resourceUrl || "");

  return {
    id: dto.id || "",
    type: "Video",
    title: dto.title || "",
    description: dto.description,
    resourceUrl: dto.resourceUrl || "",
    thumbnailUrl: dto.thumbnailUrl,
    hasUserViewed: dto.hasUserViewed ?? false,
    isActive: dto.isActive ?? true,
    createdAt: dto.createdAt || new Date().toISOString(),
    durationSeconds: dto.videoDurationSeconds,
    displayDuration: formatDuration(dto.videoDurationSeconds),
    youtubeId,
  };
}

/**
 * Transforms a learning resource DTO to a document resource view model
 */
function mapToDocumentResource(
  dto: LearningResourceDto,
): DocumentResource | null {
  // Validate PDF business rules
  if (
    dto.documentType !== "Pdf" ||
    !dto.fileSizeBytes ||
    dto.videoDurationSeconds
  ) {
    logger.warn(
      `Invalid PDF resource: ${dto.id} - missing fileSizeBytes or has videoDuration`,
      {
        id: dto.id,
        documentType: dto.documentType,
        hasFileSizeBytes: !!dto.fileSizeBytes,
        hasVideoDuration: !!dto.videoDurationSeconds,
      },
    );
    return null;
  }

  return {
    id: dto.id || "",
    type: "Pdf",
    title: dto.title || "",
    description: dto.description,
    resourceUrl: dto.resourceUrl || "",
    thumbnailUrl: dto.thumbnailUrl,
    hasUserViewed: dto.hasUserViewed ?? false,
    isActive: dto.isActive ?? true,
    createdAt: dto.createdAt || new Date().toISOString(),
    fileSizeBytes: dto.fileSizeBytes,
    formattedFileSize:
      dto.fileSizeBytes > 0 ? formatFileSize(dto.fileSizeBytes) : "0 B",
  };
}

/**
 * Normalizes a learning resource DTO to the appropriate view model
 */
export function normalizeLearningResource(
  dto: LearningResourceDto,
): LearningResource | null {
  // Skip inactive resources
  if (dto.isActive === false) {
    return null;
  }

  switch (dto.documentType) {
    case "Video":
      return mapToVideoResource(dto);
    case "Pdf":
      return mapToDocumentResource(dto);
    default:
      logger.warn(
        `Unknown document type: ${dto.documentType} for resource ${dto.id}`,
        {
          id: dto.id,
          documentType: dto.documentType,
        },
      );
      return null;
  }
}

/**
 * Transforms an array of DTOs to view models, filtering out invalid entries
 */
export function normalizeLearningResources(
  dtos: LearningResourceDto[],
): LearningResource[] {
  if (!Array.isArray(dtos)) {
    logger.error("Invalid learning resources data: expected array", undefined, {
      receivedType: typeof dtos,
      receivedValue: dtos,
    });
    return [];
  }

  return dtos
    .map(normalizeLearningResource)
    .filter((resource): resource is LearningResource => resource !== null);
}

/**
 * Separates resources into videos and documents
 */
export function separateResourcesByType(resources: LearningResource[]): {
  videos: VideoResource[];
  documents: DocumentResource[];
} {
  const videos: VideoResource[] = [];
  const documents: DocumentResource[] = [];

  resources.forEach((resource) => {
    if (resource.type === "Video") {
      videos.push(resource);
    } else if (resource.type === "Pdf") {
      documents.push(resource);
    }
  });

  return { videos, documents };
}
