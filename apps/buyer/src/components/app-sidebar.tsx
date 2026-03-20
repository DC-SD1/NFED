"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@cf/ui";
import { cn } from "@cf/ui/utils/cn";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import BuyerLogo from "@/assets/images/logos/buyer-logo.png";
import type { Locale } from "@/config/i18n-config";
import { data } from "@/lib/constants/nav";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  locale?: Locale;
}

export function AppSidebar({ locale = "en", ...props }: AppSidebarProps) {
  const pathname = usePathname();
  return (
    <Sidebar className="max-w-[280px]" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="relative my-4 -ml-6 h-[30px]">
                <Image
                  src={BuyerLogo}
                  alt="logo"
                  fill
                  className="size-full object-contain"
                />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-10 space-y-5">
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title} className="space-y-4 px-0 font-sans">
            <SidebarGroupLabel className="px-5 text-base uppercase text-black">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="text-base text-[#4F4F4F]"
                  >
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-12 rounded-none",
                        pathname === `/${locale}${item.url}` &&
                          "border-r-4 border-[hsl(var(--text-dark))] bg-[#F4FBFB] font-semibold text-[hsl(var(--text-dark))]",
                      )}
                    >
                      <Link href={`/${locale}${item.url}`} className="px-5">
                        <item.icon
                          className="!h-6 !w-6 !text-[#4F4F4F]"
                          color="#4F4F4F"
                        />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
