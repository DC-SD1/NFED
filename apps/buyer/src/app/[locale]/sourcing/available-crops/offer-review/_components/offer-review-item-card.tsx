import React from "react";

interface OfferReviewItemCardProps {
  label: string;
  value: string | number;
}

export default function OfferReviewItemCard({
  label,
  value,
}: OfferReviewItemCardProps) {
  return (
    <div className="flex w-full flex-row justify-between py-4">
      <span className="inline-block">{label}</span>
      <span className="inline-block">{value}</span>
    </div>
  );
}
