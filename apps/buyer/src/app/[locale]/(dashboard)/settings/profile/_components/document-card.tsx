"use client";

import { Button, cn } from "@cf/ui";
import { IconEdit } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

interface DocumentSectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DocumentSectionCard({
  title,
  children,
  className,
  contentClassName,
}: DocumentSectionCardProps) {
  const t = useTranslations("settings.profile.buttons");
  return (
    <div
      className={cn(
        "w-full space-y-8 rounded-2xl border-[hsl(var(--border-light))] bg-[hsl(var(--background-light))] p-4 lg:border lg:bg-transparent",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="w-40 text-base font-bold leading-[28px] md:w-full md:text-[20px]">
          {title}
        </p>

        <Button
          variant="unstyled"
          className="h-[36px] w-[75px] bg-white p-0 text-sm font-bold leading-none text-[hsl(var(--text-dark))] md:bg-transparent"
        >
          <IconEdit className="size-4" />
          {t("edit")}
        </Button>
      </div>

      <div className={cn("space-y-8", contentClassName)}>{children}</div>
    </div>
  );
}

interface DocumentRowProps {
  title: string;
  value: string;
  action?: ReactNode;
}

export function DocumentRow({ title, value, action }: DocumentRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-bold text-[#586665]">{title}</p>
        <p className="text-[15px] md:text-base">{value}</p>
      </div>
      {action}
    </div>
  );
}
