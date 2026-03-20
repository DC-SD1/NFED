"use client";

import {
  Button,
  cn,
  Drawer,
  DrawerContent,
  ScrollArea,
  Sheet,
  SheetContent,
} from "@cf/ui";
import { AlertCircle, BookOpen, RefreshCw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
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

export default function LearningResourcesDrawer() {
  const { isOpen, onClose, type, onOpen } = useModal();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const isDrawerOpen = isOpen && type === "LearningResourcesDrawer";

  const { videos, documents, isLoading, isError, refetch, isEmpty } =
    useLearningResourcesQuery();

  const handleVideoClick = useCallback(
    async (resource: VideoResource) => {
      // Close drawer first to avoid z-index issues
      onClose();

      // Small delay to ensure drawer closes before opening modal
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Open video modal
      onOpen("VideoPlayer", {
        video: {
          title: resource.title,
          videoUrl: resource.resourceUrl,
        },
      });
    },
    [onClose, onOpen],
  );

  const handleDocumentClick = useCallback((doc: DocumentResource) => {
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
  }, []);

  const closeDrawer = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isDrawerOpen) return null;

  const body = (
    <DrawerBody
      onClose={closeDrawer}
      videos={videos}
      documents={documents}
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      onVideoClick={handleVideoClick}
      onDocumentClick={handleDocumentClick}
      onRefetch={refetch}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="mt-0 flex h-[85vh] max-h-[85vh] flex-col overflow-hidden rounded-t-[24px] border-none bg-[#FBFBFB] p-0">
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        hideCloseButton
        className="my-auto flex h-[90vh] w-full max-w-[440px] flex-col overflow-hidden rounded-l-[24px] bg-[#FBFBFB] p-0"
      >
        {body}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({
  onClose,
  videos,
  documents,
  isLoading,
  isError,
  isEmpty,
  onVideoClick,
  onDocumentClick,
  onRefetch,
}: {
  onClose: () => void;
  videos: VideoResource[];
  documents: DocumentResource[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onVideoClick: (resource: VideoResource) => void;
  onDocumentClick: (doc: DocumentResource) => void;
  onRefetch: () => void;
}) {
  const t = useTranslations("dashboard.learningResources");

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 py-4">
        <div className={cn("flex h-10 items-center rounded-2xl bg-white px-2")}>
          <div className="mr-auto flex items-start">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-foreground size-9 justify-start rounded-full hover:bg-transparent"
              onClick={onClose}
            >
              <X className="size-6" />
            </Button>
          </div>
          <p className={cn("text-foreground text-sm font-bold")}>
            {t("drawerTitle")}
          </p>
          <div className="ml-auto flex items-center" />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="px-4 py-4">
            <LearningResourcesSkeleton itemCount={5} />
          </div>
        ) : isError ? (
          <DrawerErrorState onRefetch={onRefetch} />
        ) : isEmpty ? (
          <DrawerEmptyState />
        ) : (
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-2">
              {videos.map((resource) => (
                <VideoCard
                  key={resource.id}
                  resource={resource}
                  onClick={() => onVideoClick(resource)}
                />
              ))}
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onClick={() => onDocumentClick(doc)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

function DrawerEmptyState() {
  const t = useTranslations("dashboard.learningResources");

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <BookOpen className="text-muted-foreground mb-6 size-12" />
      <h3 className="text-lg font-semibold">{t("emptyDrawerTitle")}</h3>
      <p className="text-muted-foreground mt-2 text-sm">
        {t("emptyDrawerSubtitle")}
      </p>
    </div>
  );
}

function DrawerErrorState({ onRefetch }: { onRefetch: () => void }) {
  const t = useTranslations("dashboard.learningResources");

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <AlertCircle className="text-destructive mb-6 size-12" />
      <h3 className="text-lg font-semibold">{t("errorDrawerTitle")}</h3>
      <p className="text-muted-foreground mt-2 text-sm">
        {t("errorDrawerSubtitle")}
      </p>
      <Button
        variant="outline"
        className="mt-4 gap-2"
        onClick={() => onRefetch()}
      >
        <RefreshCw className="size-4" />
        {t("retry")}
      </Button>
    </div>
  );
}
