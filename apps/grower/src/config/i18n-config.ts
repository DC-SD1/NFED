export const i18n = {
  defaultLocale: "en",
  locales: ["en", "es", "fr"],
} as const

export type Locale = (typeof i18n)["locales"][number]

export const localeMap = {
  en: "English",
  es: "Español",
  fr: "Français",
} as const