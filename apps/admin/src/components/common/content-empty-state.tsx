"use client";

import { cn } from "@cf/ui";
import Image from "next/image";

import { ImageAssets } from "@/utils/image-assets";

interface Props {
  imgSrc?: string;
  title?: string;
  message?: string;
  isSmall?: boolean;
  className?: string;
  imageClassName?: string;
  hasImage?: boolean;
}

const ContentEmptyState = ({
  imgSrc = ImageAssets.USER_EMPTY_STATE,
  title,
  message,
  isSmall = false,
  className,
  imageClassName,
  hasImage = true,
}: Props) => {
  return (
    <div
      className={cn(
        "flex w-72 flex-col items-center justify-center",
        className,
      )}
    >
      {hasImage && (
        <Image
          src={imgSrc}
          width={isSmall ? 80 : 160}
          height={isSmall ? 80 : 160}
          alt={"user empty state"}
          className={imageClassName}
        />
      )}
      <p
        className={cn(
          "text-center text-xl font-semibold",
          hasImage && "mt-6",
          isSmall && "text-sm",
        )}
      >
        {title}
      </p>
      <p
        className={cn(
          "text-secondary-foreground mt-2 w-72 text-center text-sm",
          isSmall && "text-xs",
        )}
      >
        {message}
      </p>
    </div>
  );
};
export default ContentEmptyState;
