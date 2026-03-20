import type { Locale } from "@/config/i18n-config";

const dictionaries = {
  en: () =>
    import("@/config/dictionaries/en.json").then((module) => module.default),
  es: () =>
    import("@/config/dictionaries/es.json").then((module) => module.default),
  fr: () =>
    import("@/config/dictionaries/fr.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
