import { Button } from "@cf/ui";
import { IconX } from "@tabler/icons-react";
import Link from "next/link";

/**
 * Props for the ProductNav component
 */
interface ProductNavProps {
  /** The current locale for internationalization */
  locale: string;
}

/**
 * ProductNav component - Navigation header for product details page.
 *
 * This component provides a clean navigation header with:
 * - Page title display ("Crop details")
 * - Close button that navigates back to home page
 * - Proper internationalization support
 * - Consistent styling with the application design system
 *
 * The component is designed to be lightweight and focused on navigation
 * functionality while maintaining visual consistency across the application.
 *
 * @example
 * ```tsx
 * <ProductNav locale="en" />
 * ```
 *
 * @param props - Component props
 * @param props.locale - Current locale for internationalization and navigation
 * @returns JSX element containing the product navigation header
 */
export function ProductNav({ locale }: ProductNavProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 w-full bg-white p-4 md:px-8 lg:h-[72px] lg:p-0">
      <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between">
        <p className="text-xl font-semibold">Crop details</p>

        <Button
          size="icon"
          className="rounded-full bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5]"
          asChild
        >
          <Link href={`/${locale}/home`}>
            <IconX />
          </Link>
        </Button>
      </div>
    </div>
  );
}
