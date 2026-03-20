import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/config/i18n-config";
import { i18n } from "@/config/i18n-config";
import { ModalProvider } from "@/lib/providers/modal-provider";

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming locale is valid
  if (!hasLocale(i18n.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ModalProvider />
      {children}
    </NextIntlClientProvider>
  );
}
