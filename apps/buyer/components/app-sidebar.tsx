"use client";

import {
  CF,
  V0Sidebar,
  V0SidebarContent,
  V0SidebarHeader,
  V0SidebarNav,
  V0SidebarNavItem,
  V0SidebarToggle,
} from "@cf/ui";
import { usePathname } from "next/navigation";

import type { Locale } from "@/config/i18n-config";
import { getActiveNavItem, getSidebarSections } from "@/lib/config/navigation";
import { ROLES, type ValidRole } from "@/lib/schemas/auth";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";

interface AppSidebarProps {
  locale?: Locale;
}

export function AppSidebar({ locale = "en" }: AppSidebarProps) {
  const pathname = usePathname();
  const authUser = useAuthUser();
  const userRoles = authUser.roles || [];
  const primaryRole = (userRoles[0] as ValidRole) || ROLES.BUYER;
  const sidebarSections = getSidebarSections(primaryRole);
  const activeNavId = getActiveNavItem(pathname, primaryRole);

  return (
    <V0Sidebar variant="inset">
      <V0SidebarHeader className="h-42 flex flex-col items-center justify-start gap-8 p-4 py-1">
        <CF className="bg-primary flex size-14 items-center justify-center rounded-2xl" />
        {/* <div className="bg-primary flex size-14 items-center justify-center rounded-2xl">
          <span className="text-xl font-bold text-white">C</span>
        </div> */}
        <div className="flex w-full flex-row justify-end">
          <V0SidebarToggle />
        </div>
      </V0SidebarHeader>
      <V0SidebarContent className="flex-1 px-2 pt-1">
        <V0SidebarNav className="gap-3">
          {sidebarSections.map((section) => (
            <div key={section.id} className="flex flex-col gap-2">
              {section.items.map((item) => (
                <V0SidebarNavItem
                  key={item.id}
                  href={`/${locale}${item.href}`}
                  icon={<item.icon className="size-6" />}
                  label={item.label}
                  isActive={activeNavId === item.id}
                />
              ))}
            </div>
          ))}
        </V0SidebarNav>
      </V0SidebarContent>
    </V0Sidebar>
  );
}
