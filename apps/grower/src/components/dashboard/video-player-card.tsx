import { Play } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  getDurationFromResource,
  getVideoThumbnailUrl,
} from "@/lib/utils/video";
import type { VideoResource } from "@/types/learning-resources";

interface VideoCardProps {
  resource:
    | VideoResource
    | {
        title: string;
        videoUrl?: string;
        resourceUrl?: string;
        videoId?: string;
        youtubeId?: string | null;
        duration?: string;
        displayDuration?: string;
        thumbnailUrl?: string | null;
      };
  onClick: () => void;
}

export default function VideoCard({ resource, onClick }: VideoCardProps) {
  const t = useTranslations("dashboard.learningResources");
  const duration = getDurationFromResource(resource);
  const thumbnailUrl = getVideoThumbnailUrl(resource);

  return (
    <button
      className="bg-card-light-background flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors "
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${t("ariaLabelPrefix")}: ${resource.title}`}
    >
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md sm:h-14 sm:w-20">
        <Image
          src={thumbnailUrl}
          alt={resource.title}
          fill
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex size-6 items-center justify-center rounded-full bg-white/30 sm:size-8">
            <Play className="size-3 fill-white text-white sm:size-4" />
          </div>
        </div>
        {duration && (
          <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
            {duration}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 text-sm font-medium sm:line-clamp-1">
          {resource.title}
        </h2>
        {duration && (
          <p className="text-muted-foreground mt-1 text-xs">{duration}</p>
        )}
      </div>
    </button>
  );
}
