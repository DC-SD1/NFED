import { AccordionContent, AccordionItem, AccordionTrigger } from "@cf/ui";
import React from "react";

interface CropSpecificationAccordionItemProps {
  title: string;
  children?: React.ReactNode | React.ReactNode[];
}

export default function CropSpecificationAccordionItem({
  title,
  children = null,
}: CropSpecificationAccordionItemProps) {
  return (
    <AccordionItem
      value={title}
      className="rounded-xl border-none bg-[#F5F5F5] px-4"
    >
      <AccordionTrigger className="text-lg font-bold">{title}</AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}
