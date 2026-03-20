"use client";

import { SidebarProvider } from "@cf/ui";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import type { PropsWithChildren } from "react";

import ErrorBoundary from "@/components/error-boundary";
import { AppLayout } from "@/components/layout/app-layout";

export default function Layout({ children }: PropsWithChildren) {
  const locale = useLocale();
  const pathname = usePathname();

  const isNewRequestPage = pathname.match(
    /^\/[a-zA-Z-]+\/all-requests\/new\/[a-f0-9-]+\/review$/,
  );

  const isInProgressRequestPage = pathname.match(
    /^\/[a-zA-Z-]+\/all-requests\/in-progress\/[a-f0-9-]+\/review$/,
  );

  const isRejectedRequestPage = pathname.match(
    /^\/[a-zA-Z-]+\/all-requests\/rejected\/[a-f0-9-]+\/review$/,
  );

  const isCompletedRequestPage = pathname.match(
    /^\/[a-zA-Z-]+\/all-requests\/completed\/[a-f0-9-]+\/review$/,
  );

  const newFulfilmentCenter = pathname.match(
    /^\/[a-zA-Z-]+\/fulfilment-centers\/new$/,
  );

  if (
    isNewRequestPage ||
    isInProgressRequestPage ||
    isRejectedRequestPage ||
    isCompletedRequestPage ||
    newFulfilmentCenter
  ) {
    return (
      <SidebarProvider>
        <div className={"flex w-full flex-col items-center justify-center"}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <AppLayout locale={locale}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AppLayout>
  );
}
