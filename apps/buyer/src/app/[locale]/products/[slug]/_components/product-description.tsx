"use client";

import { Button } from "@cf/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

/**
 * Props for the ProductDescription component
 */
interface ProductDescriptionProps {
  /** The product name/title */
  productName?: string;
  /** The product description text */
  description?: string;
  /** Optional CSS classes for the container */
  className?: string;
  /** Optional CSS classes for the title */
  titleClassName?: string;
  /** Optional CSS classes for the description text */
  descriptionClassName?: string;
  /** Whether to show the read more functionality */
  showReadMore?: boolean;
}

/**
 * ProductDescription component - Displays product information and description.
 *
 * This component provides a clean, readable display of product information including:
 * - Product name/title with prominent styling
 * - Detailed product description text
 * - Consistent white background with rounded corners
 * - Proper spacing and typography hierarchy
 *
 * The component is designed to showcase product details in a structured,
 * easy-to-read format that maintains visual consistency with the application design.
 *
 * @example
 * ```tsx
 * <ProductDescription
 *   productName="Premium Cassava"
 *   description="High-quality cassava sourced from local farms..."
 * />
 * ```
 *
 * @param props - Component props
 * @returns JSX element containing the product description
 */
export function ProductDescription({
  productName = "Cassava",
  description = "Maize is a widely cultivated cereal crop grown in northern Ghana, where it is grown in the fertile soils of the savannah region. It is an important source of food and income for many farmers in the region. Our maize is carefully selected and sorted to ensure that only the best quality grains are sold. It is free from foreign matter, mold, and pests, and is of high nutritional value. We offer a variety of maize types, including white, yellow, and multicolored varieties. Each type has its unique flavor and texture, making them suitable for various culinary applications. Our maize is suitable for various culinary applications, including making cornmeal, cornflakes, and popcorn, as well as being a staple food in many local dishes. It is also used as animal feed for livestock. We maintain a traceability system that tracks the origin of our maize from the farm to the market. This ensures that our customers know where their food comes from and can trust its quality and safety.",
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  showReadMore = true,
}: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`space-y-4 rounded-xl bg-white p-4 ${className}`}>
      <h2 className={`text-xl font-bold ${titleClassName}`}>{productName}</h2>
      <div
        className={`text-sm leading-relaxed text-gray-700 md:text-base ${descriptionClassName}`}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <p>{description}</p>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="line-clamp-4 md:line-clamp-3 lg:line-clamp-none"
            >
              <p>{description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {showReadMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Button
              variant="link"
              className="flex h-auto bg-transparent p-0 text-sm font-bold no-underline transition-colors duration-200 lg:hidden"
              onClick={toggleExpanded}
            >
              {isExpanded ? "Read less" : "Read more"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
