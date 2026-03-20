import { cn } from "@cf/ui";
import type { ReactNode } from "react";

interface CardHeaderProps {
  /**
   * The text content to display in the header
   */
  text: string;
  /**
   * Additional class names for the text element
   */
  textClassName?: string;
  /**
   * Additional class names for the container div
   */
  containerClassName?: string;
  /**
   * Optional component to display on the right side of the header
   */
  rightComponent?: ReactNode;
}

export default function CardHeader({
  text,
  textClassName,
  containerClassName,
  rightComponent,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-14 items-center rounded-2xl bg-white px-2",
        containerClassName,
      )}
    >
      <p className={cn("text-foreground text-sm font-semibold", textClassName)}>
        {text}
      </p>
      {rightComponent && (
        <div className="ml-auto flex items-center">{rightComponent}</div>
      )}
    </div>
  );
}
