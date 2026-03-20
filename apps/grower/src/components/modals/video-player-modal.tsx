"use client";

import { Button, Dialog, DialogContent, DialogTitle } from "@cf/ui";
import { X } from "lucide-react";

import { useModal } from "@/lib/stores/use-modal";

export default function VideoPlayerModal() {
  const { isOpen, onClose, type, data } = useModal();

  // Check if this modal should be open and has video data
  const isModalOpen = isOpen && type === "VideoPlayer";
  const video = data?.video;

  // Don't render if modal shouldn't be open or no video data
  if (!isModalOpen || !video) return null;

  const getVideoUrlWithAutoplay = (url: string) => {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}autoplay=1`;
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Video Player</DialogTitle>
      <DialogContent
        className="w-full max-w-4xl p-0"
        aria-describedby={undefined}
      >
        <Button
          onClick={onClose}
          variant="unstyled"
          className="absolute right-4 top-4 z-50 rounded-full bg-white p-2 text-xl"
        >
          <X className="size-6" />
        </Button>
        <div className="relative space-y-4">
          <div className="aspect-video w-full">
            <iframe
              src={getVideoUrlWithAutoplay(video.videoUrl)}
              title={video.title}
              className="size-full rounded-xl"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
