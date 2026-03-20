"use client";

import { Button } from "@cf/ui";
import { cn } from "@cf/ui";
import { IconCheck, IconLoader, IconX } from "@tabler/icons-react";
import Link, { type LinkProps } from "next/link";

/**
 * Document status type
 */
export type DocumentStatus = "approved" | "rejected" | "pending";

/**
 * Props for the DocumentItem component
 */
export interface DocumentItemProps {
  /**
   * The title/name of the document
   * @example "Business incorporation docs", "Proof of business address"
   */
  title: string;
  /**
   * The filename of the uploaded document
   * @example "Uploadedfilename.jpeg", "business-license.pdf"
   */
  filename: string;
  /**
   * The status of the document
   * @default "pending"
   */
  status?: DocumentStatus;
  /**
   * Error message to display when document is rejected
   * @example "This document was rejected because it is invalid."
   */
  errorMessage?: string;
  /**
   * Callback function when resubmit button is clicked
   */
  onResubmit?: () => void;
  /**
   * URL to navigate to when resubmit button is clicked
   * If provided, the button will be a link instead of a button with onClick
   */
  resubmitHref?: LinkProps<string | undefined>["href"];
  /**
   * Text for the resubmit button
   * @default "Resubmit"
   */
  resubmitText?: string;
  /**
   * Whether the document is currently being uploaded
   * @default false
   */
  isUploading?: boolean;
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
}

/**
 * DocumentItem component for displaying individual document status and actions
 *
 * This component displays a document with its status (approved/rejected/pending),
 * filename, and optional error message with resubmit action for rejected documents.
 *
 * @example
 * ```tsx
 * // Approved document
 * <DocumentItem
 *   title="Business incorporation docs"
 *   filename="business-license.pdf"
 *   status="approved"
 * />
 *
 * // Rejected document with error and resubmit callback
 * <DocumentItem
 *   title="Proof of business address"
 *   filename="address-proof.jpeg"
 *   status="rejected"
 *   errorMessage="This document was rejected because it is invalid."
 *   onResubmit={() => handleResubmit("address-proof")}
 * />
 *
 * // Rejected document with error and navigation link
 * <DocumentItem
 *   title="Proof of business address"
 *   filename="address-proof.jpeg"
 *   status="rejected"
 *   errorMessage="This document was rejected because it is invalid."
 *   resubmitHref="/onboarding/documents/address-proof"
 * />
 *
 * // Pending document
 * <DocumentItem
 *   title="Corporate profile"
 *   filename="profile.pdf"
 *   status="pending"
 * />
 * ```
 *
 * @param props - The component props
 * @returns A document item with status indicator and optional actions
 */
export function DocumentItem({
  title,
  filename,
  status = "pending",
  errorMessage,
  onResubmit,
  resubmitHref,
  resubmitText = "Resubmit",
  isUploading = false,
  className = "",
}: DocumentItemProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "approved":
        return (
          <div className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[hsl(var(--success))] text-white">
            <IconCheck className="size-3" />
          </div>
        );
      case "rejected":
        return (
          <div className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[hsl(var(--error))] text-white">
            <IconX className="size-3" />
          </div>
        );
      case "pending":
        return (
          <div className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[hsl(var(--warning))] text-white">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between py-2 pr-5">
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#586665]">{title}</p>
          <p className="text-sm text-gray-600">{filename}</p>
        </div>
        {isUploading ? (
          <IconLoader className="size-4 text-[#161D1D]" />
        ) : (
          getStatusIcon()
        )}
      </div>

      {status === "rejected" && (
        <div className="flex items-center justify-between">
          {errorMessage && (
            <p className="text-xs text-[hsl(var(--error))] lg:text-sm">{errorMessage}</p>
          )}
          {(onResubmit || resubmitHref) && (
            <div className="ml-auto">
              {resubmitHref ? (
                <Link
                  href={resubmitHref}
                  onClick={() => {
                    if (onResubmit) {
                      onResubmit();
                    }
                  }}
                >
                  <Button className="h-[36px] w-[87px] rounded-lg bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))]">
                    {resubmitText}
                  </Button>
                </Link>
              ) : (
                <Button
                  className="h-[36px] w-[87px] rounded-lg bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))]"
                  onClick={onResubmit}
                >
                  {resubmitText}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
