import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@cf/ui";
import {
  IconBell,
  IconDots,
  IconLayoutSidebarLeftCollapse,
} from "@tabler/icons-react";
import Image from "next/image";

import BuyerLogo from "@/assets/images/logos/buyer-logo.png";
import { AppSidebar } from "@/components/app-sidebar";
import type { Locale } from "@/config/i18n-config";

import { MobileNav } from "./mobile-nav";

export function AppLayout({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  return (
    <SidebarProvider>
      <AppSidebar locale={locale} />
      <SidebarInset>
        <header className="container mx-auto flex h-16 shrink-0 items-center gap-2 pt-4">
          <div className="flex w-full items-center justify-between gap-2">
            <SidebarTrigger
              sidebarIcon={
                <IconLayoutSidebarLeftCollapse className="!size-6" />
              }
              className="hidden !text-black hover:bg-transparent lg:block"
            />
            <div className="block rounded-full bg-[#F5F5F5] p-2 lg:hidden">
              <IconDots className="!size-6 text-[#4F4F4F]" />
            </div>
            <div className="relative ml-48 hidden h-[24px] w-full md:block lg:hidden">
              <Image
                src={BuyerLogo.src}
                alt="Buyer Logo"
                fill
                className="size-full object-contain"
              />
            </div>
            <div className="flex w-full items-center justify-between">
              <div />
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-[#F5F5F5] p-2 hover:bg-[#F5F5F5]"
                >
                  <IconBell className="!size-6 text-[#161D1D] lg:!size-6" />
                </Button>
                <div className="flex items-center gap-2">
                  <Avatar className="!size-9 lg:!size-7">
                    <AvatarImage
                      className="!size-9 lg:!size-7"
                      src="https://github.com/shadcn.png"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex flex-1 flex-col gap-4 pb-28">{children}</main>

        <MobileNav locale={locale} />
      </SidebarInset>
    </SidebarProvider>
  );
}
