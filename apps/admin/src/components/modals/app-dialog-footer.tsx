"use client";

import { cn } from "@cf/ui";
import type { PropsWithChildren } from "react";

export default function AppDialogFooter({
  children,
  className,
  isBordered = true,
  dividerClassName,
}: PropsWithChildren & {
  className?: string;
  isBordered?: boolean;
  dividerClassName?: string;
}) {
  return (
    <>
      <hr
        className={cn(
          "mb-5 mt-10 h-0.5",
          !isBordered && "h-0 border border-transparent",
          dividerClassName,
        )}
      />

      <div className={cn("px-8", className)}>{children}</div>
    </>
  );
}
