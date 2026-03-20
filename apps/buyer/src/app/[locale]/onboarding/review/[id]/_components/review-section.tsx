"use client";

import { cn, StatusBadge } from "@cf/ui";

import type { DocumentData } from "./document-list";
import { DocumentList } from "./document-list";
import { SectionHeader } from "./section-header";

/**
 * Props for the ReviewSection component
 */
export interface ReviewSectionProps {
  /**
   * The title of the section
   * @example "Organization information", "Personal details"
   */
  title: string;
  /**
   * The status of the section
   * @default "approved"
   */
  status?: "approved" | "pending" | "rejected" | "draft" | "inReview" | "updated";
  /**
   * The status text to display in the badge
   * @example "Approved", "Pending Review", "Rejected"
   */
  statusText?: string;
  /**
   * The content to display below the header
   */
  children?: React.ReactNode;
  /**
   * Array of documents to display in this section
   * If provided, will render a DocumentList instead of children
   */
  documents?: DocumentData[];
  /**
   * Text for the resubmit button in document items
   * @default "Resubmit"
   */
  resubmitText?: string;
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
  /**
   * The title size variant
   * @default "xl"
   */
  titleSize?: "lg" | "xl" | "2xl";
  /**
   * Whether to show the status badge
   * @default true
   */
  showStatus?: boolean;
}

/**
 * ReviewSection component for displaying review sections with headers and content
 *
 * This component combines a section header with status badge and content area,
 * providing a consistent layout for review pages and detail views.
 *
 * @example
 * ```tsx
 * // Basic usage with children
 * <ReviewSection title="Organization information" status="approved">
 *   <div>Organization details content...</div>
 * </ReviewSection>
 *
 * // With documents array
 * const documents = [
 *   {
 *     id: "1",
 *     title: "Business incorporation docs",
 *     filename: "business-license.pdf",
 *     status: "approved"
 *   },
 *   {
 *     id: "2",
 *     title: "Proof of business address",
 *     filename: "address-proof.jpeg",
 *     status: "rejected",
 *     errorMessage: "This document was rejected because it is invalid.",
 *     resubmitHref: "/onboarding/documents/address-proof"
 *   }
 * ];
 *
 * <ReviewSection
 *   title="Corporate identity"
 *   status="pending"
 *   documents={documents}
 *   onDocumentResubmit={(documentId) => handleResubmit(documentId)}
 * />
 *
 * // With custom status text
 * <ReviewSection
 *   title="Personal Details"
 *   status="pending"
 *   statusText="Under Review"
 * >
 *   <PersonalDetailsForm />
 * </ReviewSection>
 *
 * // Without status badge
 * <ReviewSection
 *   title="Additional Information"
 *   showStatus={false}
 * >
 *   <AdditionalInfo />
 * </ReviewSection>
 * ```
 *
 * @param props - The component props
 * @returns A review section with header and content
 */
export function ReviewSection({
  title,
  status = "approved",
  statusText,
  children,
  documents,
  resubmitText = "Resubmit",
  className = "",
  titleSize = "xl",
  showStatus = true,
}: ReviewSectionProps) {
  // Generate status text based on status if not provided
  const getStatusText = () => {
    if (statusText) return statusText;

    const statusTextMap = {
      approved: "Approved",
      pending: "Attention",
      rejected: "Rejected",
      draft: "Draft",
      inReview: "Under Review",
      updated: "Updated",
    };

    return statusTextMap[status];
  };

  return (
    <div className={cn("py-5", className)}>
      <SectionHeader
        title={title}
        titleSize={titleSize}
        statusBadge={
          showStatus ? (
            <StatusBadge status={status}>{getStatusText()}</StatusBadge>
          ) : undefined
        }
      />
      {(children || documents) && (
        <div className="mt-4">
          {documents ? (
            <DocumentList
              documents={documents}
              resubmitText={resubmitText}
            />
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}
