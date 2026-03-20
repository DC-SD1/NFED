import { type StaticImageData } from "next/image";

import { ProductCard } from "@/components/dashboard/ProductCard";

/**
 * Props for individual product items in the carousel
 */
export interface ProductCarouselItem {
  /** Unique identifier for the product */
  id: string;
  /** Product image source */
  image: StaticImageData;
  /** Product name */
  name: string;
  /** Product category */
  category: string;
  /** Available quantity */
  quantity: number;
  /** Product details array */
  details: {
    title: string;
    value: string;
  }[];
}

/**
 * Props for the ProductCarousel component
 */
export interface ProductCarouselProps {
  /** Title displayed above the carousel */
  title: string;
  /** Array of products to display in the carousel */
  products: ProductCarouselItem[];
  /** Optional CSS classes for the container */
  className?: string;
  /** Optional CSS classes for the title */
  titleClassName?: string;
  /** Optional CSS classes for the carousel container */
  carouselClassName?: string;
  /** Minimum width for each product card */
  cardMinWidth?: string;
  /** Callback function when a product is clicked */
  onProductClick?: (product: ProductCarouselItem, index: number) => void;
  /** Whether the carousel is disabled */
  disabled?: boolean;
  /** Custom CSS classes for individual product cards */
  cardClassName?: string;
}

/**
 * ProductCarousel component - Horizontal scrolling carousel for displaying related products.
 *
 * This component provides a horizontal scrolling carousel with:
 * - Customizable title
 * - Horizontal scrolling with snap behavior
 * - Responsive product cards
 * - Click handlers for product interactions
 * - Consistent styling with the application design system
 *
 * The carousel is designed to showcase related products, varieties, or recommendations
 * in a clean, scrollable format that works well on both desktop and mobile devices.
 *
 * @example
 * ```tsx
 * const products = [
 *   {
 *     id: "cassava-1",
 *     image: CassavaImg,
 *     name: "Cassava Variety A",
 *     category: "Roots and tubers",
 *     quantity: 30000,
 *     details: [
 *       { title: "Variety", value: "Bankye hemaa" },
 *       { title: "Price", value: "350" }
 *     ]
 *   },
 *   // ... more products
 * ];
 *
 * <ProductCarousel
 *   title="Diverse varieties of the same crop"
 *   products={products}
 *   onProductClick={(product, index) => console.log("Selected:", product)}
 * />
 * ```
 *
 * @param props - Component props
 * @returns JSX element containing the product carousel
 */
export function ProductCarousel({
  title,
  products,
  className = "",
  titleClassName = "",
  carouselClassName = "",
  cardMinWidth = "",
  onProductClick,
  disabled = false,
  cardClassName = "",
}: ProductCarouselProps) {
  /**
   * Handles product card click
   */
  const handleProductClick = (product: ProductCarouselItem, index: number) => {
    if (disabled) return;
    onProductClick?.(product, index);
  };

  // Don't render if no products
  if (!products || products.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3
          className={`text-[20px] font-bold md:text-[28px] ${titleClassName}`}
        >
          {title}
        </h3>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">No products available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Title */}
      <h3 className={`text-[24px] font-bold md:text-[28px] ${titleClassName}`}>
        {title}
      </h3>

      {/* Product Carousel */}
      <div
        className={`no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1.5 ${carouselClassName}`}
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${cardClassName}`}
            style={{ minWidth: cardMinWidth }}
            onClick={() => handleProductClick(product, index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleProductClick(product, index);
              }
            }}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`View product: ${product.name}`}
          >
            <ProductCard
              product={product}
              className={disabled ? "pointer-events-none" : ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Specialized ProductCarousel variant for displaying product varieties.
 * Pre-configured with appropriate styling for variety displays.
 */
export function ProductVarietiesCarousel({
  title = "Diverse varieties of the same crop",
  products,
  ...props
}: Omit<ProductCarouselProps, "title"> & { title?: string }) {
  return (
    <ProductCarousel
      title={title}
      products={products}
      cardMinWidth=""
      cardClassName="min-w-[280px] md:min-w-[340px]"
      {...props}
    />
  );
}

/**
 * Specialized ProductCarousel variant for displaying recommended products.
 * Pre-configured with appropriate styling for recommendation displays.
 */
export function RecommendedProductsCarousel({
  title = "Other crops you might also like",
  products,
  ...props
}: Omit<ProductCarouselProps, "title"> & { title?: string }) {
  return (
    <ProductCarousel
      title={title}
      products={products}
      cardClassName="min-w-[280px] md:min-w-[340px]"
      {...props}
    />
  );
}
