"use client";

import {
  CF,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@cf/ui";

import SidebarMainNav from "@/components/layout/sidebar-main-nav";
import { SIDE_BAR_MENU } from "@/lib/config/side-bar";

interface AppSidebarProps {
  locale?: string;
}

export function AppSidebar({ locale = "en" }: AppSidebarProps) {
  return (
    <Sidebar
      collapsible={"icon"}
      variant="inset"
      className={"rounded-none border-r border-r-[#E5E8DF] p-0"}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <CF className="bg-primary flex size-8 items-center justify-center rounded-md" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-sm font-semibold">CF Admin</span>
                <span className="text-secondary-foreground truncate text-xs">
                  Complete Farmer
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className={"mt-2"}>
        <SidebarMainNav items={SIDE_BAR_MENU} locale={locale} />
      </SidebarContent>
    </Sidebar>
  );
}
