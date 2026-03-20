"use client";

import { Badge, Button } from "@cf/ui";
import { IconPencilMinus } from "@tabler/icons-react";
import { useState } from "react";

import { DocumentView } from "../dialog/document-view";
import { ReviewItemList } from "./review-item-list";

interface ReviewItemListProps {
  label: string;
  value: string;
  hasViewButton?: boolean;
  onClick?: () => void;
  documentUrl?: string;
}

interface Crop {
  value: string;
  label: string;
}

interface ReviewSectionProps {
  title: string;
  badgeText?: string;
  buttonText: string;
  buttonOnClick?: () => void;
  reviews?: ReviewItemListProps[] | null;
  crops?: Crop[] | null;
  details?: {
    description?: string;
    quantity?: string;
  };
}

export function ReviewSection({
  title,
  badgeText,
  buttonText,
  buttonOnClick,
  reviews,
  crops,
  details,
}: ReviewSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState<string>("");

  const handleViewDocument = (documentUrl: string) => {
    setCurrentDocumentUrl(documentUrl);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentDocumentUrl("");
  };

  return (
    <div className="space-y-5">
      <DocumentView
        documentUrl={currentDocumentUrl}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
      <div className="flex items-center justify-between">
        <p className="text-base font-bold md:text-xl">{title}</p>
        <div className="flex gap-2">
          {badgeText && (
            <Badge
              className={`rounded-lg px-2 py-0.5 lg:px-4 lg:py-1.5 ${
                badgeText === "Incomplete"
                  ? "bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FEE2E2] hover:text-[#991B1B]"
                  : badgeText === "Skipped"
                    ? "bg-[#D5E3FD] text-[#00439E] hover:bg-[#D5E3FD] hover:text-[#00439E]"
                    : "bg-[#C9F0D6] text-[#00572D] hover:bg-[#C9F0D6] hover:text-[#00572D]"
              }`}
            >
              {badgeText}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hidden font-bold hover:bg-transparent md:block"
            onClick={buttonOnClick}
          >
            {buttonText}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary block size-auto px-0 font-bold hover:bg-transparent md:hidden"
            onClick={buttonOnClick}
          >
            <IconPencilMinus className="!size-6" />
          </Button>
        </div>
      </div>

      {details && (
        <div className="flex items-center justify-between text-[#161D1D]">
          <p>{details.description}</p>
          <p>{details.quantity}</p>
        </div>
      )}

      {crops && (
        <div className="flex flex-wrap gap-2">
          {crops?.map((crop) => (
            <Badge
              key={crop.value}
              className="rounded-lg bg-[#F5F5F5] px-4 py-1.5 font-normal text-[#161D1D] hover:bg-[#F5F5F5] hover:text-[#161D1D]"
            >
              {crop.label}
            </Badge>
          ))}
        </div>
      )}

      {reviews && (
        <div className="space-y-10">
          {reviews?.map((review) => (
            <ReviewItemList
              key={review.label}
              label={review.label}
              value={review.value}
              hasViewButton={review.hasViewButton}
              onClick={() =>
                review.documentUrl && handleViewDocument(review.documentUrl)
              }
              documentUrl={review.documentUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
