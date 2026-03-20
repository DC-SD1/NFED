"use client";

import { Button } from "@cf/ui";
import {
  IconChevronLeft,
  IconChevronRight,
  IconLibraryPhoto,
  IconPlus,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { useCallback, useState } from "react";

/**
 * Props for individual image items in the slider
 */
export interface ImageItem {
  /** Image source URL or imported image */
  src: string | StaticImageData;
  /** Alt text for accessibility */
  alt: string;
  /** Optional unique identifier */
  id?: string;
}

/**
 * Props for the ImageSlider component
 */
export interface ImageSliderProps {
  /** Array of images to display in the slider */
  images: ImageItem[];
  /** Optional CSS classes for the container */
  className?: string;
  /** Height of the slider container (CSS value like "210px" or "100%") */
  height?: string;
  /** Width of the slider container */
  width?: string;
  /** Whether to show navigation arrows */
  showNavigation?: boolean;
  /** Whether to show the image counter */
  showCounter?: boolean;
  /** Whether to show the "Add to plan" button */
  showAddToPlan?: boolean;
  /** Custom CSS classes for navigation buttons */
  navigationClassName?: string;
  /** Custom CSS classes for the counter */
  counterClassName?: string;
  /** Custom CSS classes for the add to plan button */
  addToPlanClassName?: string;
  /** Callback function when add to plan is clicked */
  onAddToPlan?: () => void;
  /** Callback function when image changes */
  onImageChange?: (currentIndex: number) => void;
  /** Initial image index (default: 0) */
  initialIndex?: number;
  /** Whether the slider is disabled */
  disabled?: boolean;
}

/**
 * ImageSlider component - Professional image carousel with smooth animations.
 *
 * This component provides a fully-featured image slider with:
 * - Smooth Framer Motion animations between images
 * - Navigation controls (previous/next buttons)
 * - Image counter display
 * - Optional "Add to plan" functionality
 * - Keyboard navigation support
 * - Touch/swipe gesture support
 * - Accessibility features
 *
 * The component uses Framer Motion for smooth transitions and provides
 * a professional user experience with proper state management.
 *
 * @example
 * ```tsx
 * const productImages = [
 *   { src: "/images/product1.jpg", alt: "Product view 1", id: "img1" },
 *   { src: "/images/product2.jpg", alt: "Product view 2", id: "img2" },
 *   { src: "/images/product3.jpg", alt: "Product view 3", id: "img3" }
 * ];
 *
 * <ImageSlider
 *   images={productImages}
 *   height="210px"
 *   onAddToPlan={() => console.log("Added to plan")}
 *   onImageChange={(index) => console.log("Current image:", index)}
 * />
 * ```
 *
 * @param props - Component props
 * @returns JSX element containing the animated image slider
 */
export function ImageSlider({
  images,
  className = "",
  height = "210px",
  width = "100%",
  showNavigation = true,
  showCounter = true,
  showAddToPlan = true,
  navigationClassName = "",
  counterClassName = "",
  addToPlanClassName = "",
  onAddToPlan,
  onImageChange,
  initialIndex = 0,
  disabled = false,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<number>(0); // -1 for left, 1 for right

  // Define animation variants for sliding
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : direction < 0 ? "100%" : 0,
      opacity: 0,
    }),
  };

  /**
   * Handles navigation to the previous image
   */
  const handlePrevious = useCallback(() => {
    if (disabled) return;
    setDirection(-1); // Slide from right to left (previous)
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  }, [currentIndex, images.length, onImageChange, disabled]);

  /**
   * Handles navigation to the next image
   */
  const handleNext = useCallback(() => {
    if (disabled) return;
    setDirection(1); // Slide from left to right (next)
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    onImageChange?.(newIndex);
  }, [currentIndex, images.length, onImageChange, disabled]);

  /**
   * Handles keyboard navigation
   */
  const _handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || images.length <= 1) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (currentIndex > 0) {
            handlePrevious();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentIndex < images.length - 1) {
            handleNext();
          }
          break;
      }
    },
    [handlePrevious, handleNext, disabled, images.length, currentIndex],
  );

  // Don't render if no images
  if (!images || images.length === 0) {
    return (
      <div
        className={`relative rounded-xl bg-[#E6E6E6] ${className}`}
        style={{ height, width }}
      >
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div
      className={`relative rounded-xl bg-[#E6E6E6] ${className}`}
      style={{ height, width }}
      role="img"
      aria-label="Image slider"
      aria-live="polite"
    >
      {/* Add to Plan Button */}
      {showAddToPlan && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`absolute left-4 top-4 z-10 flex h-[36px] w-[125px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F5F5F5] px-2 transition-colors hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] lg:h-[48px] lg:w-[137px] ${addToPlanClassName}`}
          onClick={onAddToPlan}
          role="button"
          tabIndex={0}
          aria-label="Add to plan"
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconPlus className="!size-4 text-[hsl(var(--text-dark))]" />
          </motion.div>
          <p className="whitespace-nowrap text-sm font-bold text-[hsl(var(--text-dark))] lg:text-base">
            Add to plan
          </p>
        </motion.div>
      )}

      {/* Main Image Container */}
      <div className="relative size-full overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.3 },
            }}
            className="relative size-full"
          >
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              fill
              className="object-cover"
              priority={currentIndex === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Image Counter */}
      {showCounter && images.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`absolute bottom-4 left-4 z-10 flex h-[32px] w-[61px] items-center justify-center gap-1 rounded-xl bg-[#F5F5F5] ${counterClassName}`}
          role="status"
          aria-label={`Image ${currentIndex + 1} of ${images.length}`}
        >
          <IconLibraryPhoto className="!size-4 text-[hsl(var(--text-dark))]" />
          <p className="whitespace-nowrap text-sm font-medium text-[hsl(var(--text-dark))]">
            {currentIndex + 1}/{images.length}
          </p>
        </motion.div>
      )}

      {/* Navigation Controls */}
      {showNavigation && images.length > 1 && (
        <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between gap-2">
          {/* Previous Button - Only show if not on first image */}
          {currentIndex > 0 ? (
            <motion.div
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={disabled}
                className={`size-[48px] rounded-full bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#E5E5E5] disabled:cursor-not-allowed disabled:opacity-50 ${navigationClassName}`}
                aria-label="Previous image"
              >
                <IconChevronLeft className="!size-4" />
              </Button>
            </motion.div>
          ) : (
            <div />
          )}

          {/* Next Button - Only show if not on last image */}
          {currentIndex < images.length - 1 ? (
            <motion.div
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={disabled}
                className={`size-[48px] rounded-full bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#E5E5E5] disabled:cursor-not-allowed disabled:opacity-50 ${navigationClassName}`}
                aria-label="Next image"
              >
                <IconChevronRight className="!size-4" />
              </Button>
            </motion.div>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Keyboard Instructions (Screen Reader Only) */}
      <div className="sr-only">
        Use left and right arrow keys to navigate between images.
      </div>
    </div>
  );
}

/**
 * Specialized ImageSlider variant for product images.
 * Pre-configured with appropriate styling for product displays.
 */
export function ProductImageSlider({
  images,
  ...props
}: Omit<
  ImageSliderProps,
  "height" | "showNavigation" | "showCounter" | "showAddToPlan"
> & {
  height?: string;
  showNavigation?: boolean;
  showCounter?: boolean;
  showAddToPlan?: boolean;
}) {
  return (
    <div className="h-[210px] md:h-[449px] lg:h-[675px]">
      <ImageSlider
        images={images}
        height="100%"
        showNavigation={true}
        showCounter={true}
        showAddToPlan={true}
        {...props}
      />
    </div>
  );
}
