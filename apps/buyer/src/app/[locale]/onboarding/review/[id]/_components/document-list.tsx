"use client";

import { cn } from "@cf/ui";

import type { DocumentStatus } from "./document-item";
import { DocumentItem } from "./document-item";

/**
 * Document data structure
 */
export interface DocumentData {
  /**
   * Unique identifier for the document
   */
  id: string;
  /**
   * The title/name of the document
   */
  title: string;
  /**
   * The filename of the uploaded document
   */
  filename: string;
  /**
   * The status of the document
   */
  status: DocumentStatus;
  /**
   * Error message to display when document is rejected
   */
  errorMessage?: string;
  /**
   * URL to navigate to when resubmit button is clicked
   */
  resubmitHref?: string;
  /**
   * Logical field name used by resubmission tracker
   */
  fieldName?: string;
  /**
   * Latest value persisted in onboarding store for this document
   */
  uploadValue?: string | string[];
  /**
   * Whether the user has uploaded a replacement file for this document
   */
  hasUpdatedUpload?: boolean;
  /**
   * Whether the document is currently uploading a replacement
   */
  isUploading?: boolean;
}

/**
 * Props for the DocumentList component
 */
export interface DocumentListProps {
  /**
   * Array of documents to display
   */
  documents: DocumentData[];
  /**
   * Callback function when resubmit button is clicked
   * @param documentId - The ID of the document being resubmitted
   */
  onResubmit?: (documentId: string) => void;
  /**
   * Text for the resubmit button
   * @default "Resubmit"
   */
  resubmitText?: string;
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
  /**
   * Spacing between document items
   * @default "space-y-3"
   */
  spacing?: string;
}

const extractFilename = (path: string) => {
  try {
    const url = new URL(path);
    const pathname = url.pathname || "";
    const lastSegment = pathname.split("/").filter(Boolean).pop();
    return lastSegment || path;
  } catch {
    const parts = path.split("/");
    return parts.pop() || path;
  }
};

const resolveDisplayFilename = (
  uploadValue: string | string[] | undefined,
  fallback: string,
) => {
  if (!uploadValue) return fallback;

  if (Array.isArray(uploadValue)) {
    const names = uploadValue
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value) => extractFilename(value));
    return names.length > 0 ? names.join(", ") : fallback;
  }

  if (uploadValue.trim().length === 0) {
    return fallback;
  }

  return extractFilename(uploadValue);
};

/**
 * DocumentList component for displaying a list of documents with their statuses
 *
 * This component renders a list of DocumentItem components, handling the display
 * of multiple documents with different statuses and actions.
 *
 * @example
 * ```tsx
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
 *     errorMessage: "This document was rejected because it is invalid."
 *   }
 * ];
 *
 * <DocumentList
 *   documents={documents}
 *   onResubmit={(documentId) => handleResubmit(documentId)}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A list of document items with their statuses and actions
 */
export function DocumentList({
  documents,
  onResubmit,
  resubmitText = "Resubmit",
  className = "",
  spacing = "space-y-3",
}: DocumentListProps) {
  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <div className={cn(spacing, className)}>
      {documents.map((document) => {
        const buttonText = document.hasUpdatedUpload ? "Edit" : resubmitText;
        const showUploadingState = document.isUploading ?? false;
        const filename = resolveDisplayFilename(document.uploadValue, document.filename);

        return (
          <DocumentItem
            key={document.id}
            title={document.title}
            filename={filename}
            status={document.status}
            errorMessage={document.errorMessage}
            onResubmit={onResubmit ? () => onResubmit(document.id) : undefined}
            resubmitHref={document.resubmitHref}
            resubmitText={buttonText}
            isUploading={showUploadingState}
          />
        );
      })}
    </div>
  );
}
