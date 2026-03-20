import { Button } from "@cf/ui";
import {
  IconChevronLeft,
  IconChevronRight,
  IconLibraryPhoto,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface GalleryPreviewProps {
  images: (string | StaticImageData)[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GalleryPreview({
  images,
  isOpen,
  onOpenChange,
}: GalleryPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  };

  const handleClose = useCallback(() => {
    setCurrentIndex(0);
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-[#323838]/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />

      {/* Modal Content Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Navigation Row */}
        <div className="relative flex items-center justify-center">
          {/* Previous Button - Outside left (only show if not first item) */}
          {currentIndex > 0 ? (
            <Button
              onClick={prevImage}
              className="relative -right-12 z-10 h-10 w-10 rounded-full border-0 bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] focus:bg-[#F5F5F5] focus:text-[hsl(var(--text-dark))] md:-right-14 md:h-12 md:w-12 lg:right-14"
              size="sm"
            >
              <IconChevronLeft className="size-4" />
            </Button>
          ) : (
            <div className="relative -right-12 z-10 h-10 w-10 md:-right-14 md:h-12 md:w-12 lg:right-14" />
          )}

          {/* Main Modal Content */}
          <motion.div
            className="relative h-[240px] w-[336px] max-w-[95vw] overflow-hidden rounded-xl bg-white md:h-[449px] md:w-[664px] lg:h-[747px] lg:w-[964px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Main Image Display */}
            <div className="relative h-full w-full bg-[#E6E6E6]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={
                      typeof images[currentIndex] === "string"
                        ? images[currentIndex]
                        : images[currentIndex].src
                    }
                    alt={`Product image ${currentIndex + 1}`}
                    className="object-cover"
                    fill
                    sizes="964px"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Next Button - Outside right (only show if not last item) */}
          {currentIndex < images.length - 1 ? (
            <Button
              onClick={nextImage}
              className="relative -left-12 z-10 h-10 w-10 rounded-full border-0 bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] focus:bg-[#F5F5F5] focus:text-[hsl(var(--text-dark))] md:-left-14 md:h-12 md:w-12 lg:left-14"
              size="sm"
            >
              <IconChevronRight className="size-4" />
            </Button>
          ) : (
            <div className="relative -left-12 z-10 h-10 w-10 md:-left-14 md:h-12 md:w-12 lg:left-14" />
          )}
        </div>

        {/* Image Counter - Below and Centered */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-4 flex h-[32px] w-[61px] items-center justify-center gap-1 rounded-xl bg-[#F5F5F5]"
          role="status"
          aria-label={`Image ${currentIndex + 1} of ${images.length}`}
        >
          <IconLibraryPhoto className="!size-4 text-[hsl(var(--text-dark))]" />
          <p className="whitespace-nowrap text-sm font-medium text-[hsl(var(--text-dark))]">
            {currentIndex + 1}/{images.length}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
