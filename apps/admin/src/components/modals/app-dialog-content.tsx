"use client";

import { cn } from "@cf/ui";
import type { PropsWithChildren } from "react";

export default function AppDialogContent({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return <div className={cn("px-8", className)}>{children}</div>;
}
