"use client";

import { Button, Card, CardContent, CardFooter, CardHeader } from "@cf/ui";
import {
  AlertCircle,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useLearningResourcesQuery } from "@/lib/queries/learning-resources-query";
import { useModal } from "@/lib/stores/use-modal";
import { logger } from "@/lib/utils/logger";
import { showErrorToast } from "@/lib/utils/toast";
import type {
  DocumentResource,
  VideoResource,
} from "@/types/learning-resources";

import DocumentCard from "./document-card";
import LearningResourcesSkeleton from "./skeletons/learning-resources-skeleton";
import VideoCard from "./video-player-card";

export default function LearningResourcesCard() {
  const t = useTranslations("dashboard.learningResources");
  const { onOpen } = useModal();

  // Fetch learning resources from API
  const {
    videos,
    documents,
    isLoading,
    isError,
    error: _error,
    refetch,
    isEmpty,
  } = useLearningResourcesQuery();

  const handleVideoClick = (resource: VideoResource) => {
    onOpen("VideoPlayer", {
      video: {
        title: resource.title,
        videoUrl: resource.resourceUrl,
      },
    });
  };

  const handleDocumentClick = (doc: DocumentResource) => {
    try {
      // Ensure URL is absolute and starts with http/https
      if (
        !doc.resourceUrl.startsWith("http://") &&
        !doc.resourceUrl.startsWith("https://")
      ) {
        logger.error("Invalid document URL: must be absolute", undefined, {
          resourceUrl: doc.resourceUrl,
        });
        showErrorToast("Unable to open document. Invalid URL.");
        return;
      }
      const url = new URL(doc.resourceUrl);
      window.open(url.href, "_blank", "noopener,noreferrer");
    } catch (error) {
      showErrorToast("Unable to open document. Invalid URL.");
      logger.error("Invalid document URL:", error, {
        resourceUrl: doc.resourceUrl,
      });
    }
  };

  return (
    <Card className="w-full rounded-3xl border-none shadow-[0_16px_40px_rgba(36,108,70,0.14)]">
      <CardHeader className="px-3 pb-3 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-normal">{t("title")}</h2>
          <MoreHorizontal className="size-6" />
        </div>
        <div className="bg-gray-light mt-0.5 h-0.5 w-full"></div>
      </CardHeader>
      <CardContent className="mb-2 max-h-56 space-y-2 overflow-y-auto px-3">
        {/* Loading state */}
        {isLoading && <LearningResourcesSkeleton itemCount={3} />}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <AlertCircle className="text-destructive mb-2 size-8" />
            <p className="text-muted-foreground mb-2 text-sm">
              {t("errorLoadingResources")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="size-3" />
              {t("retry")}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && !isError && !isLoading && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground text-sm">
              {t("noResourcesAvailable")}
            </p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && !isEmpty && (
          <>
            {videos.map((resource) => (
              <VideoCard
                key={resource.id}
                resource={resource}
                onClick={() => handleVideoClick(resource)}
              />
            ))}
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onClick={() => handleDocumentClick(doc)}
              />
            ))}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end px-3 py-1">
        <Button
          variant="unstyled"
          className="text-primary px-0 text-sm font-bold"
          onClick={() => {
            onOpen("LearningResourcesDrawer");
          }}
        >
          {t("viewMore")}
          <ChevronRight className=" size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
