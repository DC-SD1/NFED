"use client";

import { cn, SidebarToggle, useIsMobile, useSidebar } from "@cf/ui";
import { IconSearch } from "@tabler/icons-react";
import { AlignJustify, PanelLeft } from "lucide-react";
import * as React from "react";

import NotificationMenu from "@/components/layout/notification-menu";
import ProfileMenu from "@/components/layout/profile-menu";
import { getLeftMargin } from "@/utils/helpers/common-helpers";

export default function AppNavBar({ locale = "en" }: { locale?: string }) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] =
    React.useState(false);
  const isMobile = useIsMobile(1024);
  // const isScrolling = useScrollDetection(20);
  const { state, isMobile: isToggleModal } = useSidebar();

  const leftMargin = getLeftMargin(isToggleModal, state);

  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 border-b border-[#E5E8DF] bg-container px-8 py-4 transition-all duration-200 ease-linear sm:items-center sm:py-3",
        "fixed inset-x-0 top-0 z-10",
      )}
      style={{ left: leftMargin }}
    >
      <div className={isMobile ? "" : "border-r border-r-[#E5E8DF] pr-3"}>
        <SidebarToggle icon={isMobile ? AlignJustify : PanelLeft} />
      </div>
      <div className="flex flex-1 items-center px-4">
        <div className="relative w-full max-w-[400px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <IconSearch className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border-none bg-[#E8F3E5] py-2 pl-10 pr-3 text-sm placeholder:text-gray-500 focus:ring-0"
            placeholder="Search"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationMenu
          isOpen={isNotificationMenuOpen}
          onOpenChange={setIsNotificationMenuOpen}
        />
        <ProfileMenu
          isOpen={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
          locale={locale}
        />
      </div>
    </header>
  );
}
