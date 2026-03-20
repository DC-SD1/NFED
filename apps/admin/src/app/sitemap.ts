import type { MetadataRoute } from "next";

import { i18n } from "@/config/i18n-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://admin.completefarmer.com";

  // Static routes
  const staticRoutes = ["", "/"];

  // Generate URLs for all locales
  const urls: MetadataRoute.Sitemap = [];

  i18n.locales.forEach((locale) => {
    staticRoutes.forEach((route) => {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: route === "" ? 1.0 : 0.8,
      });
    });
  });

  // Add root URL redirects
  urls.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  });

  return urls;
}
