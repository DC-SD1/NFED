import { cn } from "@cf/ui";

/**
 * Props for individual product detail items
 */
export interface ProductDetailItem {
  /** The label/field name for this detail */
  label: string;
  /** The value/content for this detail */
  value: string;
  /** Optional unique identifier for the item */
  id?: string;
  /** Optional additional CSS classes for the item */
  className?: string;
}

/**
 * Props for the ProductDetailsCard component
 */
export interface ProductDetailsCardProps {
  /** The main product name */
  productName: string;
  /** The product category */
  productCategory: string;
  /** Array of detail items to display */
  details: ProductDetailItem[];
  /** Optional height for the container */
  height?: string;
  /** Optional CSS classes for the container */
  className?: string;
  /** Optional CSS classes for the header section */
  headerClassName?: string;
  /** Optional CSS classes for the product name */
  productNameClassName?: string;
  /** Optional CSS classes for the product category */
  productCategoryClassName?: string;
  /** Optional CSS classes for the details container */
  detailsClassName?: string;
  /** Optional CSS classes for individual detail items */
  detailItemClassName?: string;
  /** Optional CSS classes for detail labels */
  detailLabelClassName?: string;
  /** Optional CSS classes for detail values */
  detailValueClassName?: string;
  /** Custom background color for the container (defaults to white) */
  backgroundColor?: string;
  /** Custom border color for details section (defaults to hsl(var(--border-light))) */
  borderColor?: string;
  /** Custom divider color (defaults to hsl(var(--border-light))) */
  dividerColor?: string;
  /** Padding for the container (defaults to p-4) */
  padding?: string;
  /** Whether to show dividers between detail items */
  showDividers?: boolean;
}

/**
 * ProductDetailsCard component for displaying product information in a structured format.
 *
 * This component provides a consistent way to display product details with proper
 * styling, accessibility features, and customizable appearance. It's commonly used
 * for product information sections, specifications, and other structured product data.
 *
 * @example
 * ```tsx
 * const productDetails = [
 *   { label: "Variety", value: "Legin-18", id: "variety" },
 *   { label: "Origin", value: "Ghana", id: "origin" },
 *   { label: "Harvest Year", value: "2024", id: "harvest-year" },
 *   { label: "Grade", value: "Premium", id: "grade" },
 *   { label: "Certification", value: "Organic", id: "certification" }
 * ];
 *
 * <ProductDetailsCard
 *   productName="Cassava"
 *   productCategory="Roots and tubers"
 *   details={productDetails}
 *   height="552px"
 * />
 * ```
 *
 * @example
 * ```tsx
 * const specifications = [
 *   { label: "Moisture", value: "12.5% Max" },
 *   { label: "Quality Grade", value: "Premium" },
 *   { label: "Storage", value: "Dry Storage" }
 * ];
 *
 * <ProductDetailsCard
 *   productName="Premium Maize"
 *   productCategory="Grains"
 *   details={specifications}
 *   backgroundColor="#F8F9FA"
 *   borderColor="#D1D5DB"
 *   showDividers={true}
 * />
 * ```
 */
export function ProductDetailsCard({
  productName,
  productCategory,
  details,
  height,
  className = "",
  headerClassName = "",
  productNameClassName = "",
  productCategoryClassName = "",
  detailsClassName = "",
  detailItemClassName = "",
  detailLabelClassName = "",
  detailValueClassName = "",
  backgroundColor = "white",
  borderColor = "hsl(var(--border-light))",
  dividerColor = "hsl(var(--border-light))",
  padding = "p-4",
  showDividers = true,
}: ProductDetailsCardProps) {
  return (
    <div
      className={cn("w-full space-y-12 rounded-xl", padding, className)}
      style={{
        backgroundColor,
        height,
      }}
    >
      {/* Product Header Section */}
      <div className={cn("space-y-1", headerClassName)}>
        <h2
          className={cn(
            "text-xl font-bold text-gray-900 md:text-[36px]",
            productNameClassName,
          )}
        >
          {productName}
        </h2>
        <p className={cn("text-gray-600", productCategoryClassName)}>
          {productCategory}
        </p>
      </div>

      {/* Details Container */}
      <div
        className={cn(
          "rounded-xl border px-4",
          showDividers && "divide-y",
          detailsClassName,
        )}
        style={{
          borderColor,
          ...(showDividers &&
            ({
              "--tw-divide-color": dividerColor,
            } as React.CSSProperties)),
        }}
        role="list"
        aria-label={`${productName} details`}
      >
        {details.map((detail, index) => (
          <div
            key={detail.id || index}
            className={cn("py-4", detailItemClassName, detail.className)}
            role="listitem"
            aria-label={`${detail.label}: ${detail.value}`}
          >
            <p
              className={cn(
                "text-xs font-bold text-[#586665] md:text-sm",
                detailLabelClassName,
              )}
            >
              {detail.label}
            </p>
            <p
              className={cn(
                "text-sm text-gray-700 md:text-base",
                detailValueClassName,
              )}
            >
              {detail.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Specialized ProductDetailsCard variant for displaying product specifications.
 * Pre-configured with appropriate styling for specification data.
 */
export function ProductSpecsCard({
  productName,
  productCategory,
  details,
  ...props
}: Omit<ProductDetailsCardProps, "showDividers"> & { showDividers?: boolean }) {
  return (
    <ProductDetailsCard
      productName={productName}
      productCategory={productCategory}
      details={details}
      showDividers={true}
      backgroundColor="white"
      borderColor="hsl(var(--border-light))"
      dividerColor="hsl(var(--border-light))"
      {...props}
    />
  );
}

/**
 * Specialized ProductDetailsCard variant for displaying product information.
 * Pre-configured with appropriate styling for general product information.
 */
export function ProductInfoCard({
  productName,
  productCategory,
  details,
  ...props
}: Omit<ProductDetailsCardProps, "showDividers"> & { showDividers?: boolean }) {
  return (
    <ProductDetailsCard
      productName={productName}
      productCategory={productCategory}
      details={details}
      showDividers={true}
      backgroundColor="white"
      borderColor="hsl(var(--border-light))"
      dividerColor="hsl(var(--border-light))"
      {...props}
    />
  );
}
