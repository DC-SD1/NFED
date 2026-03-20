"use client";

import { cn } from "@cf/ui";

interface Props {
  title: string;
  toolBar?: React.ReactNode;
  className?: string;
}

export default function AppTitleToolBar({ title, toolBar, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-4 py-3.5 sm:flex-row sm:items-center sm:justify-between", className)}>
      <h1 className="text-xl font-semibold sm:text-[1.8rem]">{title}</h1>
      {toolBar}
    </div>
  );
}
