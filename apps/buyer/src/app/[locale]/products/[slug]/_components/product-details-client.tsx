"use client";

import type { Locale } from "next-intl";
import { useEffect, useState } from "react";

import { ProductDetails, ProductNav, ProductSidebar } from ".";

/**
 * Props for the ProductDetailsClient component
 */
interface ProductDetailsClientProps {
  /** Promise containing the locale parameter */
  params: Promise<{ locale: Locale }>;
}

/**
 * ProductDetailsClient component - Main client-side container for product details page.
 *
 * This component serves as the main layout container for the product details page,
 * orchestrating the display of product information, navigation, and interactive elements.
 * It handles locale resolution and provides a responsive layout structure.
 *
 * @example
 * ```tsx
 * // Used in page.tsx
 * export default function ProductPage({ params }: { params: Promise<{ locale: Locale }> }) {
 *   return <ProductDetailsClient params={params} />;
 * }
 * ```
 *
 * @param props - Component props
 * @param props.params - Promise containing locale information for internationalization
 * @returns JSX element containing the complete product details page layout
 */
export default function ProductDetailsClient({
  params,
}: ProductDetailsClientProps) {
  const [locale, setLocale] = useState<Locale | null>(null);

  useEffect(() => {
    void params.then(({ locale: resolvedLocale }) => {
      setLocale(resolvedLocale);
    });
  }, [params]);

  if (!locale) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen space-y-6 bg-white pb-10 md:bg-[hsl(var(--background-light))]">
      <ProductNav locale={locale} />

      <div className="mx-auto w-full max-w-screen-xl px-4 pt-12 md:px-8 md:pt-16 lg:px-0">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ProductDetails />
          <ProductSidebar />
        </div>
      </div>
    </div>
  );
}
