import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;

  // Fallback to default locale if not provided
  if (!locale) {
    locale = routing.defaultLocale;
  }

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !hasLocale(routing.locales, locale)) {
    // Return a valid configuration with default locale instead of notFound
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../config/dictionaries/${locale}.json`)).default,
  };
});
