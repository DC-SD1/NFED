import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTriggerWithEditButton,
} from "@cf/ui";
import React from "react";

interface SourcingReviewAccordionProps {
  title: string;
  children: React.ReactNode | React.ReactNode[];
  onPressEdit: () => void;
}

export default function SourcingReviewAccordion({
  title,
  children,
  onPressEdit,
}: SourcingReviewAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full rounded-md border border-[hsl(var(--border-light))] bg-white px-4"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTriggerWithEditButton
          onPressEdit={onPressEdit}
          className="text-lg font-bold"
        >
          {title}
        </AccordionTriggerWithEditButton>

        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
