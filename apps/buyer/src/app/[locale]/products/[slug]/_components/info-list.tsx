import { cn } from "@/lib/utils";

/**
 * Props for individual info list items
 */
export interface InfoListItem {
  /** The content to display for this item */
  content: string;
  /** Optional unique identifier for the item */
  id?: string;
  /** Optional additional CSS classes for the item */
  className?: string;
}

/**
 * Props for the InfoList component
 */
export interface InfoListProps {
  /** Title displayed at the top of the info list */
  title: string;
  /** Array of items to display in the list */
  items: InfoListItem[];
  /** Optional CSS classes for the container */
  className?: string;
  /** Optional CSS classes for the title */
  titleClassName?: string;
  /** Optional CSS classes for the items container */
  itemsClassName?: string;
  /** Optional CSS classes for individual items */
  itemClassName?: string;
  /** Whether to show dividers between items */
  showDividers?: boolean;
  /** Custom divider color (defaults to hsl(var(--border-light))) */
  dividerColor?: string;
  /** Custom background color for the container (defaults to white) */
  backgroundColor?: string;
  /** Custom border color (defaults to hsl(var(--border-light))) */
  borderColor?: string;
  /** Optional height for the container */
  height?: string;
  /** Padding for the container (defaults to p-4) */
  padding?: string;
}

/**
 * InfoList component for displaying structured information in a clean, organized format.
 *
 * This component provides a consistent way to display lists of information with proper
 * styling, accessibility features, and customizable appearance. It's commonly used for
 * specifications, certifications, and other structured data.
 *
 * @example
 * ```tsx
 * const certifications = [
 *   { content: "Non-GMO", id: "non-gmo" },
 *   { content: "Certificate of origin", id: "cert-origin" },
 *   { content: "ISO 9001:2015", id: "iso-9001" }
 * ];
 *
 * <InfoList
 *   title="Certifications"
 *   items={certifications}
 *   height="284px"
 * />
 * ```
 *
 * @example
 * ```tsx
 * const specifications = [
 *   { content: "Moisture 12.5% Max" },
 *   { content: "Total defective grains 5% max" },
 *   { content: "Live insects - Absent" }
 * ];
 *
 * <InfoList
 *   title="Other specifications"
 *   items={specifications}
 *   showDividers={true}
 *   backgroundColor="#F8F9FA"
 *   borderColor="#D1D5DB"
 * />
 * ```
 */
export function InfoList({
  title,
  items,
  className = "",
  titleClassName = "",
  itemsClassName = "",
  itemClassName = "",
  showDividers = true,
  dividerColor = "hsl(var(--border-light))",
  backgroundColor = "white",
  borderColor = "hsl(var(--border-light))",
  height,
  padding = "p-4",
}: InfoListProps) {
  return (
    <div
      className={cn("w-full space-y-5 rounded-xl", padding, className)}
      style={{
        backgroundColor,
        height,
      }}
    >
      {/* Title Section */}
      <h3 className={cn("text-xl font-bold text-gray-900", titleClassName)}>
        {title}
      </h3>

      {/* Items Container */}
      <div
        className={cn(
          "rounded-xl border px-4",
          showDividers && "divide-y",
          itemsClassName,
        )}
        style={{
          borderColor,
          ...(showDividers &&
            ({
              "--tw-divide-color": dividerColor,
            } as React.CSSProperties)),
        }}
        role="list"
        aria-label={`${title} information`}
      >
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className={cn(
              "py-4 text-sm text-gray-700 md:text-base",
              itemClassName,
              item.className,
            )}
            role="listitem"
            aria-label={`${title} item ${index + 1}`}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Specialized InfoList variant for displaying product specifications.
 * Pre-configured with appropriate styling for specification data.
 */
export function ProductSpecifications({
  title = "Specifications",
  items,
  ...props
}: Omit<InfoListProps, "title"> & { title?: string }) {
  return (
    <InfoList
      title={title}
      items={items}
      showDividers={true}
      backgroundColor="white"
      borderColor="hsl(var(--border-light))"
      dividerColor="hsl(var(--border-light))"
      {...props}
    />
  );
}

/**
 * Specialized InfoList variant for displaying certifications.
 * Pre-configured with appropriate styling for certification data.
 */
export function ProductCertifications({
  title = "Certifications",
  items,
  ...props
}: Omit<InfoListProps, "title"> & { title?: string }) {
  return (
    <InfoList
      title={title}
      items={items}
      showDividers={true}
      backgroundColor="white"
      borderColor="hsl(var(--border-light))"
      dividerColor="hsl(var(--border-light))"
      {...props}
    />
  );
}
