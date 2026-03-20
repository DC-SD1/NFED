"use client";

import { cn } from "@cf/ui/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/config/i18n-config";
import { data } from "@/lib/constants/nav";

export function MobileNav({ locale = "en" }: { locale?: Locale }) {
  const pathname = usePathname();
  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 block h-20 border-t bg-white p-4 md:p-6 lg:hidden">
      <div className="flex items-center justify-between">
        {data.navMain.map((item) => {
          return (
            item.title === "Dashboard" &&
            item.items.map((item) => {
              const isActive = pathname === `/${locale}${item.url}`;
              return (
                <Link
                  key={item.title}
                  href={`/${locale}${item.url}`}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 text-[#161D1D]",
                    isActive && "relative font-bold text-[hsl(var(--text-dark))]",
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-x-0 -top-4 h-0.5 bg-[hsl(var(--text-dark))] md:-top-6" />
                  )}
                  <item.icon
                    className={cn("!size-6", isActive && "text-[hsl(var(--text-dark))]")}
                  />
                  <span className="text-xs text-[#161D1D]">{item.title}</span>
                </Link>
              );
            })
          );
        })}
      </div>
    </footer>
  );
}
