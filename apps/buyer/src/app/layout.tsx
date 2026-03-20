import "@cf/ui/styles/buyer.css";

import { cn } from "@cf/ui";
import { Toaster } from "@cf/ui/components/sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import { ClerkProviderWrapper } from "@/components/clerk-provider-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { PHProvider, PostHogPageview } from "@/config/providers";
import { siteConfig } from "@/config/site";
import { ModalProvider } from "@/lib/providers/modal-provider";
import TanstackQueryProvider from "@/lib/providers/tanstack-query-provider";
import ProgressProvider from "@/providers/ProgressProvider";

const fontSans = localFont({
  src: [
    {
      path: "../styles/fonts/Cera-Pro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../styles/fonts/Cera-Pro-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../styles/fonts/Cera-Pro-Bold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../styles/fonts/Cera-Pro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../styles/fonts/Cera-Pro-Black.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../styles/fonts/Cera-Pro-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "../styles/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "buyer",
    "buyer platform",
    "agriculture",
    "crop tracking",
    "Complete Farmer",
    "agricultural technology",
  ],
  authors: [
    {
      name: "Complete Farmer",
    },
  ],
  creator: "Complete Farmer",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#4B908B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Buyer" />
      </head>
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
        )}
      >
        <Suspense>
          <ClerkProviderWrapper>
            <PHProvider>
              <TanstackQueryProvider>
                <PostHogPageview />
                <ThemeProvider attribute="class" defaultTheme="light">
                  <NuqsAdapter>
                    <ModalProvider />
                    <ProgressProvider>{children}</ProgressProvider>
                    <Toaster richColors position="top-right" expand />
                  </NuqsAdapter>
                </ThemeProvider>
              </TanstackQueryProvider>
            </PHProvider>
          </ClerkProviderWrapper>
        </Suspense>

        <Script
          id="useberry-tracking"
          strategy="afterInteractive"
          type="text/javascript"
          src="https://api.useberry.com/integrations/liveUrl/scripts/useberryScript.js"
        />
      </body>
    </html>
  );
}
