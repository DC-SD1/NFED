import { cn } from "@cf/ui";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Status badge variants configuration using class-variance-authority
 * Defines the visual styles for different status types
 */
const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-md text-xs font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      status: {
        approved: "bg-[#C9F0D6] text-[#00572D]",
        pending: "bg-[#FFF3CD] text-[#856404]",
        rejected: "bg-[#F8D7DA] text-[#721C24]",
        draft: "bg-[#E2E3E5] text-[#383D41]",
        inReview: "bg-[#D1ECF1] text-[#0C5460]",
        updated: "bg-[#D5E3FD] text-[#00439E]",
      },
      size: {
        sm: "h-[18px] px-2 text-[10px]",
        md: "h-[22px] px-2.5 text-xs",
        lg: "h-[26px] px-3 text-sm",
      },
    },
    defaultVariants: {
      status: "approved",
      size: "md",
    },
  },
);

/**
 * Props for the StatusBadge component
 * Extends standard HTML div attributes and adds status-specific props
 */
export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  /**
   * The status text to display in the badge
   * @example "Approved", "Pending Review", "Rejected"
   */
  children: React.ReactNode;
  /**
   * The status type that determines the badge's visual appearance
   * @default "approved"
   */
  status?:
    | "approved"
    | "pending"
    | "rejected"
    | "draft"
    | "inReview"
    | "updated";
  /**
   * The size of the badge
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}

/**
 * StatusBadge component for displaying status information with consistent styling
 *
 * This component provides a standardized way to display status information
 * across the application with predefined color schemes and sizes.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StatusBadge status="approved">Approved</StatusBadge>
 *
 * // With custom size
 * <StatusBadge status="pending" size="sm">Pending Review</StatusBadge>
 *
 * // With custom className
 * <StatusBadge
 *   status="rejected"
 *   className="ml-2"
 * >
 *   Rejected
 * </StatusBadge>
 * ```
 *
 * @param props - The component props
 * @returns A styled status badge element
 */
function StatusBadge({
  className,
  status,
  size,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <div
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { StatusBadge, statusBadgeVariants };
