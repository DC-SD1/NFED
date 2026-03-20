"use client";

import { cn, SidebarInset, SidebarProvider } from "@cf/ui";
import * as React from "react";
import { Suspense } from "react";

import AppNavBar from "@/components/layout/app-nav-bar";
import { AppSidebar } from "@/components/layout/app-sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  locale?: string;
}

export function AppLayout({ children, locale = "en" }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-container">
        {/* Desktop Sidebar */}
        <AppSidebar locale={locale} />
        <SidebarInset
          className={
            "overflow-hidden md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none"
          }
        >
          {/* Main Content Area */}
          <div className="flex flex-1 flex-col">
            {/* Sticky Header */}
            <Suspense fallback={<div>Loading...</div>}>
              <AppNavBar locale={locale} />
            </Suspense>

            {/* Main Content */}
            <main className={cn("mt-16 flex-1 bg-container pb-6 sm:pb-10")}>
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
