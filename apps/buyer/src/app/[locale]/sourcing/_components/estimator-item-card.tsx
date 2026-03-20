import { cn } from "@cf/ui";

/**
 * Props interface for the EstimatorItemCard component
 */
interface EstimatorItemCardProps {
  /** The title/label for the cost item */
  title?: string;
  /** Whether the item is pending */
  isPending?: boolean;
  /** The subtitle/description for the cost item */
  subtitle?: string;
  /** The price amount to display */
  price?: string;
  /** The quantity/unit information */
  quantity?: string;
  /** Optional CSS class name for additional styling */
  className?: string;
}

/**
 * EstimatorItemCard component displays a cost estimation item with title, price, and quantity information
 *
 * @param props - The component props
 * @param props.title - The title/label for the cost item (e.g., "Farmgate price")
 * @param props.subtitle - The subtitle/description for the cost item (e.g., "Unit/Qty")
 * @param props.price - The price amount to display (e.g., "GHS 60,000")
 * @param props.quantity - The quantity/unit information (e.g., "120MT")
 * @param props.className - Optional CSS class name for additional styling
 * @returns JSX element representing the estimator item card
 *
 * @example
 * ```tsx
 * <EstimatorItemCard
 *   title="Farmgate price"
 *   subtitle="Unit/Qty"
 *   price="GHS 60,000"
 *   quantity="120MT"
 * />
 * ```
 */
export function EstimatorItemCard({
  title,
  subtitle,
  price,
  quantity,
  className = "",
  isPending,
}: EstimatorItemCardProps) {
  return (
    <div
      className={cn(
        "flex w-[368px] items-center justify-between rounded-xl bg-white p-2",
        {
          "h-[48px]": title && !subtitle && price && !quantity,
          "h-[72px]": title && subtitle && price && quantity,
        },
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-[#161D1D]">{title}</p>
        {!isPending && subtitle && (
          <p className="text-sm text-[#586665]">{subtitle}</p>
        )}
      </div>
      {isPending ? (
        <div className="text-right">
          <p className="text-[#161D1D]">Pending</p>
        </div>
      ) : (
        <div className="space-y-1 text-right">
          <p className="text-[#161D1D]">{price}</p>
          {quantity && <p className="text-sm text-[#586665]">{quantity}</p>}
        </div>
      )}
    </div>
  );
}
