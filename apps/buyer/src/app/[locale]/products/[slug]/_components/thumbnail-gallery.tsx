"use client";

import { motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { useCallback, useState } from "react";

import { GalleryPreview } from "@/app/[locale]/products/[slug]/_components";

/**
 * Props for individual thumbnail items
 */
export interface ThumbnailItem {
  /** Image source URL or imported image */
  src: string | StaticImageData;
  /** Alt text for accessibility */
  alt: string;
  /** Optional unique identifier */
  id?: string;
  /** Whether this thumbnail is currently selected */
  isSelected?: boolean;
}

/**
 * Props for the ThumbnailGallery component
 */
export interface ThumbnailGalleryProps {
  /** Array of thumbnail images to display */
  thumbnails: ThumbnailItem[];
  /** Currently selected thumbnail index */
  selectedIndex?: number;
  /** Callback function when a thumbnail is clicked */
  onThumbnailClick?: (index: number, thumbnail: ThumbnailItem) => void;
  /** Number of thumbnails to show before the "+X" indicator */
  maxVisibleThumbnails?: number;
  /** Optional CSS classes for the container */
  className?: string;
  /** Height of the gallery container (supports responsive classes like "h-[98px] md:h-[118px] lg:h-[155px]") */
  height?: string;
  /** Width of the gallery container */
  width?: string;
  /** Custom CSS classes for individual thumbnails */
  thumbnailClassName?: string;
  /** Custom CSS classes for the selected thumbnail */
  selectedThumbnailClassName?: string;
  /** Custom CSS classes for the "+X" indicator */
  indicatorClassName?: string;
  /** Whether the gallery is disabled */
  disabled?: boolean;
  /** Whether to show the "+X" indicator for additional images */
  showIndicator?: boolean;
}

/**
 * ThumbnailGallery component - Interactive thumbnail navigation for image galleries.
 *
 * This component provides a grid of thumbnail images with:
 * - Interactive thumbnail selection
 * - Visual feedback for selected thumbnails
 * - "+X" indicator for additional images beyond visible thumbnails
 * - Smooth animations and hover effects
 * - Responsive grid layout
 *
 * The component is designed to work seamlessly with image sliders,
 * allowing users to quickly navigate to specific images by clicking thumbnails.
 *
 * @example
 * ```tsx
 * const thumbnails = [
 *   { src: "/images/thumb1.jpg", alt: "Thumbnail 1", id: "thumb1" },
 *   { src: "/images/thumb2.jpg", alt: "Thumbnail 2", id: "thumb2" },
 *   { src: "/images/thumb3.jpg", alt: "Thumbnail 3", id: "thumb3" },
 *   { src: "/images/thumb4.jpg", alt: "Thumbnail 4", id: "thumb4" }
 * ];
 *
 * <ThumbnailGallery
 *   thumbnails={thumbnails}
 *   selectedIndex={0}
 *   onThumbnailClick={(index, thumbnail) => console.log("Selected:", index)}
 *   height="h-[98px] md:h-[118px] lg:h-[155px]"
 *   maxVisibleThumbnails={3}
 * />
 * ```
 *
 * @param props - Component props
 * @returns JSX element containing the thumbnail gallery
 */
export function ThumbnailGallery({
  thumbnails,
  selectedIndex = 0,
  onThumbnailClick,
  maxVisibleThumbnails = 3,
  className = "",
  height = "h-[98px] md:h-[118px] lg:h-[155px]",
  width = "100%",
  thumbnailClassName = "",
  selectedThumbnailClassName = "",
  indicatorClassName = "",
  disabled = false,
  showIndicator = true,
}: ThumbnailGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Handles thumbnail click
   */
  const handleThumbnailClick = useCallback(
    (index: number) => {
      if (disabled) return;
      const thumbnail = thumbnails[index];
      onThumbnailClick?.(index, thumbnail);
    },
    [disabled, onThumbnailClick, thumbnails],
  );

  /**
   * Handles thumbnail hover
   */
  const handleThumbnailHover = useCallback(
    (index: number | null) => {
      if (disabled) return;
      setHoveredIndex(index);
    },
    [disabled],
  );

  // Calculate responsive visible thumbnails
  // On mobile: show 2 normal + 1 with overlay (total 3)
  // On md to 2xl screens: show 3 normal + 1 with overlay (total 4)
  const getVisibleCount = () => {
    // Mobile: 2 normal thumbnails, third slot is "+X" indicator
    // Larger screens: 3 normal thumbnails, fourth slot is "+X" indicator
    return maxVisibleThumbnails;
  };

  const visibleThumbnails = thumbnails.slice(0, getVisibleCount());
  const remainingCount = thumbnails.length - getVisibleCount();
  const shouldShowIndicator = showIndicator && remainingCount > 0;

  // Don't render if no thumbnails
  if (!thumbnails || thumbnails.length === 0) {
    return (
      <div
        className={`grid w-full gap-3 ${height} ${className}`}
        style={{
          width,
          gridTemplateColumns: `repeat(${getVisibleCount() + 1}, 1fr)`,
        }}
      >
        <div className="flex items-center justify-center rounded-xl bg-[#E6E6E6]">
          <p className="text-gray-500">No thumbnails available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid w-full gap-3 ${height} ${className}`}
      style={{
        width,
        gridTemplateColumns: `repeat(${getVisibleCount() + 1}, 1fr)`,
      }}
    >
      <GalleryPreview
        images={thumbnails.map((t) => t.src)}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
      {/* Visible Thumbnails */}
      {visibleThumbnails.map((thumbnail, index) => {
        const isSelected = index === selectedIndex;
        const isHovered = index === hoveredIndex;

        return (
          <motion.div
            key={thumbnail.id || index}
            className={`relative size-full cursor-pointer overflow-hidden rounded-xl bg-[#E6E6E6] ${thumbnailClassName} ${
              isSelected ? selectedThumbnailClassName : ""
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={() => handleThumbnailClick(index)}
            onMouseEnter={() => handleThumbnailHover(index)}
            onMouseLeave={() => handleThumbnailHover(null)}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            transition={{ duration: 0.2 }}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Select thumbnail ${index + 1}: ${thumbnail.alt}`}
            aria-pressed={isSelected}
          >
            <Image
              src={thumbnail.src}
              alt={thumbnail.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
            />

            {/* Hover Overlay */}
            {isHovered && !disabled && !isSelected && (
              <motion.div
                className="absolute inset-0 bg-black/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
        );
      })}

      {/* "+X" Indicator for Additional Images */}
      {shouldShowIndicator && (
        <motion.div
          className={`relative size-full cursor-pointer overflow-hidden rounded-xl bg-[#E6E6E6] ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          } ${indicatorClassName}`}
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => handleThumbnailHover(getVisibleCount())}
          onMouseLeave={() => handleThumbnailHover(null)}
          transition={{ duration: 0.2 }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`View ${remainingCount} additional images`}
        >
          {/* Background Image (first additional image) */}
          {thumbnails[getVisibleCount()] && (
            <Image
              src={thumbnails[getVisibleCount()].src}
              alt={thumbnails[getVisibleCount()].alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
            />
          )}

          {/* Overlay with Count */}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 text-white">
            <motion.p
              className="text-[36px] font-bold"
              whileHover={!disabled ? { scale: 1.1 } : {}}
              transition={{ duration: 0.2 }}
            >
              +{remainingCount}
            </motion.p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Specialized ThumbnailGallery variant for product images.
 * Pre-configured with appropriate styling for product displays.
 */
export function ProductThumbnailGallery({
  thumbnails,
  selectedIndex = 0,
  onThumbnailClick,
  ...props
}: Omit<
  ThumbnailGalleryProps,
  "height" | "maxVisibleThumbnails" | "showIndicator"
> & {
  height?: string;
  maxVisibleThumbnails?: number;
  showIndicator?: boolean;
}) {
  return (
    <>
      <div className="block md:hidden">
        {/* Mobile: 2 normal + 1 overlay (3 total) */}
        <ThumbnailGallery
          thumbnails={thumbnails}
          selectedIndex={selectedIndex}
          onThumbnailClick={onThumbnailClick}
          height="h-[98px]"
          maxVisibleThumbnails={2}
          showIndicator={true}
          {...props}
        />
      </div>
      <div className="hidden md:block">
        {/* Medium and larger screens: 3 normal + 1 overlay (4 total) */}
        <ThumbnailGallery
          thumbnails={thumbnails}
          selectedIndex={selectedIndex}
          onThumbnailClick={onThumbnailClick}
          height="h-[118px] lg:h-[155px]"
          maxVisibleThumbnails={3}
          showIndicator={true}
          {...props}
        />
      </div>
    </>
  );
}
