"use client";

import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@cf/ui";
import { IconCircle } from "@tabler/icons-react";
import { useState } from "react";

import { RadioSelected } from "./icons/radio-selected";

const categories = [
  "All categories",
  "Fruits and vegetables",
  "Roots and tubers",
  "Grains and cereals",
];

export function CropFilterSheet() {
  const [selectedCategory, setSelectedCategory] = useState("All categories");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="h-[36px] w-[137px] rounded-full border-0 bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] focus:bg-[#F5F5F5] focus:text-[hsl(var(--text-dark))] focus:ring-0 focus:ring-offset-0 lg:hidden">
          {selectedCategory}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-auto overflow-y-auto rounded-t-3xl"
        overlayClassName="bg-black/10 backdrop-blur-sm"
        closeButtonClassName="right-16 flex items-center justify-center w-14 h-14 rounded-full bg-[#F5F5F5] text-[#161D1D] hover:bg-[#F5F5F5]"
        closeButtonIconClassName="!size-6"
      >
        <SheetHeader className="relative mx-auto w-full md:w-[664px]">
          <SheetTitle className="text-center text-lg font-semibold md:text-[20px]">
            Filters categories
          </SheetTitle>
        </SheetHeader>

        <div className="mx-auto my-6 w-full md:w-[664px]">
          {categories.map((category) => (
            <div
              key={category}
              className="flex h-[56px] w-full cursor-pointer items-center justify-between"
              onClick={() => setSelectedCategory(category)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedCategory(category);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <p>{category}</p>
              {selectedCategory === category ? (
                <RadioSelected className="size-6 text-[hsl(var(--border-light))]" />
              ) : (
                <IconCircle className="size-6 text-[hsl(var(--border-light))]" />
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
