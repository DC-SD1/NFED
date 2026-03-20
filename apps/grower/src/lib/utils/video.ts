import { logger } from "./logger";

/**
 * Extracts YouTube video ID from various YouTube URL formats
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - youtube.com/watch?v=VIDEO_ID&feature=share
 *
 * @param url - The YouTube URL to extract ID from
 * @returns The video ID or null if not found
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    // Handle various YouTube URL patterns
    const patterns = [
      // Standard watch URLs
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|m\.youtube\.com)\/watch\?v=([a-zA-Z0-9_-]{11})/,
      // Shortened youtu.be URLs
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      // Embedded URLs
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      // Old v/ format
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      // YouTube Shorts
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      // With timestamp or other parameters
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    // If URL contains youtube.com or youtu.be but doesn't match patterns,
    // try to extract anything that looks like a video ID
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      // Look for an 11-character alphanumeric string
      const idMatch = /[a-zA-Z0-9_-]{11}/.exec(url);
      if (idMatch) {
        return idMatch[0];
      }
    }

    return null;
  } catch (error) {
    logger.error("Error extracting YouTube video ID:", error);
    return null;
  }
}

/**
 * Formats video duration from seconds to human-readable format
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "2:45" or "1:02:30")
 */
export function formatDuration(seconds: number | null | undefined): string {
  // Handle null/undefined
  if (seconds == null) return "0:00";

  // Warn about invalid negative values
  if (seconds < 0) {
    logger.warn(`Invalid negative duration: ${seconds} seconds`);
    return "0:00";
  }

  if (seconds === 0) return "0:00";

  // Zero is a valid duration
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    // Format: h:mm:ss
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else {
    // Format: m:ss or mm:ss
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
}

/**
 * Generates YouTube thumbnail URL from video ID
 *
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality (default, mq, hq, sd, maxres)
 * @returns Thumbnail URL
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality:
    | "default"
    | "mqdefault"
    | "hqdefault"
    | "sddefault"
    | "maxresdefault" = "mqdefault",
): string {
  if (!videoId) return "";
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Safely extracts video ID from a resource object
 * Supports multiple property names for backwards compatibility
 *
 * @param resource - Object that may contain video ID properties
 * @returns Video ID or null if not found
 */
export function getVideoIdFromResource(resource: {
  youtubeId?: string | null;
  videoId?: string;
}): string | null {
  return resource.youtubeId ?? resource.videoId ?? null;
}

/**
 * Gets thumbnail URL for a video resource
 * Tries YouTube thumbnail first, then custom thumbnail, then fallback
 *
 * @param resource - Object containing video metadata
 * @param fallbackUrl - URL to use if no thumbnail is found
 * @param quality - YouTube thumbnail quality
 * @returns Thumbnail URL
 */
export function getVideoThumbnailUrl(
  resource: {
    youtubeId?: string | null;
    videoId?: string;
    thumbnailUrl?: string | null;
  },
  fallbackUrl = "/images/video-placeholder.png",
  quality:
    | "default"
    | "mqdefault"
    | "hqdefault"
    | "sddefault"
    | "maxresdefault" = "mqdefault",
): string {
  // Try to get YouTube thumbnail first
  const videoId = getVideoIdFromResource(resource);
  if (videoId) {
    return getYouTubeThumbnailUrl(videoId, quality);
  }

  // Fallback to custom thumbnail
  if (resource.thumbnailUrl) {
    return resource.thumbnailUrl;
  }

  // Final fallback
  return fallbackUrl;
}

/**
 * Safely extracts duration string from a resource object
 * Supports multiple property names for backwards compatibility
 *
 * @param resource - Object that may contain duration properties
 * @returns Duration string or null if not found
 */
export function getDurationFromResource(resource: {
  displayDuration?: string;
  duration?: string;
}): string | null {
  return resource.displayDuration ?? resource.duration ?? null;
}
