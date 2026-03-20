import { useMemo } from "react";

import {
  normalizeLearningResources,
  separateResourcesByType,
} from "@/components/dashboard/learning-resource-card.mapper";
import { useApiClient } from "@/lib/api/client";
import type {
  DocumentResource,
  LearningResource,
  VideoResource,
} from "@/types/learning-resources";

interface UseLearningResourcesOptions {
  pageNumber?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface UseLearningResourcesReturn {
  items: LearningResource[];
  videos: VideoResource[];
  documents: DocumentResource[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
  isEmpty: boolean;
}

/**
 * Custom hook to fetch and manage learning resources
 */
export function useLearningResourcesQuery(
  options: UseLearningResourcesOptions = {},
): UseLearningResourcesReturn {
  const { pageNumber = 1, pageSize = 50, enabled = true } = options;
  const api = useApiClient();

  // Fetch learning resources from API
  const {
    data: response,
    isLoading,
    error,
    isError,
    refetch,
  } = api.useQuery(
    "get",
    "/learning-resources",
    {
      params: {
        query: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      },
    },
    {
      enabled,
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          error.status === 401
        ) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  );

  // Transform and memoize the data
  const { items, videos, documents } = useMemo(() => {
    if (!response?.items) {
      return { items: [], videos: [], documents: [] };
    }

    const normalizedItems = normalizeLearningResources(response.items || []);
    const separated = separateResourcesByType(normalizedItems);

    return {
      items: normalizedItems,
      videos: separated.videos,
      documents: separated.documents,
    };
  }, [response?.items]);

  const isEmpty = !isLoading && items.length === 0;

  return {
    items,
    videos,
    documents,
    isLoading,
    isError,
    error,
    refetch,
    isEmpty,
  };
}

/**
 * Query key root for learning resources - useful for invalidation
 */
export const LEARNING_RESOURCES_QUERY_KEY_ROOT = [
  "get",
  "/learning-resources",
] as const;
