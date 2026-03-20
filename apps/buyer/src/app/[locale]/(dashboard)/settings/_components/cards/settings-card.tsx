import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Locale } from "@/config/i18n-config";

interface SettingsCardProps {
  locale: Locale;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

export function SettingsCard({
  locale,
  title,
  description,
  href,
  icon,
}: SettingsCardProps) {
  return (
    <Link
      href={`/${locale}${href}`}
      aria-label={title}
      className="group flex h-full flex-col rounded-2xl border border-[hsl(var(--border-light))] p-5 transition-all duration-300 hover:border-transparent hover:shadow-[0px_2px_64px_0px_#161D141A]"
    >
      <div className="flex items-center justify-between">
        <div className="text-primary flex size-10 items-center justify-center rounded-full bg-[#F5F5F5]">
          {icon}
        </div>

        <span className="flex size-6 items-center justify-center rounded-full bg-transparent text-[#586665] transition-colors duration-200 group-hover:bg-[#F5F5F5]">
          <IconChevronRight className="size-5" />
        </span>
      </div>

      <div className="mt-6 space-y-2">
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </Link>
  );
}
