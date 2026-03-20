import "@cf/ui/styles/globals.css";

import { cn } from "@cf/ui";
import { Toaster } from "@cf/ui/components/sonner";
import localFont from "next/font/local";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import { ClerkProviderWrapper } from "@/components/clerk-provider-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { PHProvider, PostHogPageview } from "@/config/providers";
import { siteConfig } from "@/config/site";
import TanstackQueryProvider from "@/lib/providers/tanstack-query-provider";

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

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "farming",
    "grower",
    "agriculture",
    "farm management",
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
      <head />
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
        )}
      >
        <Suspense>
          <ClerkProviderWrapper>
            <TanstackQueryProvider>
              <PHProvider>
                <PostHogPageview />
                <ThemeProvider attribute="class" defaultTheme="light">
                  <NuqsAdapter>
                    {children}
                    <Toaster richColors position="top-center" expand />
                  </NuqsAdapter>
                </ThemeProvider>
              </PHProvider>
            </TanstackQueryProvider>
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
