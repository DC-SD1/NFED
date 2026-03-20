/**
 * Props for the SectionHeader component
 */
export interface SectionHeaderProps {
  /**
   * The title text to display
   * @example "Organization information", "Personal details"
   */
  title: string;
  /**
   * The status badge to display on the right side
   * @example <StatusBadge status="approved">Approved</StatusBadge>
   */
  statusBadge?: React.ReactNode;
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
  /**
   * The title size variant
   * @default "xl"
   */
  titleSize?: "lg" | "xl" | "2xl";
}

/**
 * SectionHeader component for displaying section titles with optional status badges
 *
 * This component provides a consistent layout for section headers with titles
 * and optional status indicators. It's commonly used in review and detail pages.
 *
 * @example
 * ```tsx
 * // Basic usage with title only
 * <SectionHeader title="Organization information" />
 *
 * // With status badge
 * <SectionHeader
 *   title="Organization information"
 *   statusBadge={<StatusBadge status="approved">Approved</StatusBadge>}
 * />
 *
 * // With custom title size
 * <SectionHeader
 *   title="Personal Details"
 *   titleSize="lg"
 *   statusBadge={<StatusBadge status="pending">Pending</StatusBadge>}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A section header with title and optional status badge
 */
export function SectionHeader({
  title,
  statusBadge,
  className = "",
  titleSize = "xl",
}: SectionHeaderProps) {
  const titleSizeClasses = {
    lg: "text-lg font-bold",
    xl: "text-base md:text-xl font-bold",
    "2xl": "text-2xl font-bold",
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <p className={titleSizeClasses[titleSize]}>{title}</p>
      {statusBadge && statusBadge}
    </div>
  );
}
