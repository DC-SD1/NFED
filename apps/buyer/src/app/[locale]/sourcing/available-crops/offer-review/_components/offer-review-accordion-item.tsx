import { AccordionContent, AccordionItem, AccordionTrigger } from "@cf/ui";
import React from "react";

const convertToCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHS", // Change to your currency (e.g., 'EUR', 'NGN', etc.)
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface OfferReviewAccordionItemProps {
  label: string;
  totalCost: number;
  children?: React.ReactNode | React.ReactNode[];
}

export default function OfferReviewAccordionItem({
  label,
  totalCost,
  children = null,
}: OfferReviewAccordionItemProps) {
  return (
    <AccordionItem
      value={label}
      className="rounded-xl border-none bg-[#F5F5F5] px-6 pt-2"
    >
      <AccordionTrigger className="gap-x-4 font-bold">
        <div className="flex flex-1 flex-row justify-between">
          {label}
          <span>{convertToCurrency(totalCost)}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}
