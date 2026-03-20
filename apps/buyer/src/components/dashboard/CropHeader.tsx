"use client";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cf/ui";
import { Search } from "@cf/ui/icons";
import { IconArrowRight, IconPencil } from "@tabler/icons-react";
import { useState } from "react";

import { CropFilterSheet } from "@/app/[locale]/(dashboard)/home/_components/crop-filter-sheet";
import { CropInterestSheet } from "@/app/[locale]/(dashboard)/home/_components/crop-interest-sheet";

interface CropHeaderProps {
  title?: string;
  onSeeAll?: () => void;
  className?: string;
  searchTerm?: string;
  category?: string;
  onSearchChange?: (term: string) => void;
  onCategoryChange?: (category: string) => void;
}

export function CropHeader({
  title = "Crop listing",
  onSeeAll,
  className,
  searchTerm = "",
  category = "",
  onSearchChange,
  onCategoryChange,
}: CropHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const onEditInterest = () => {
    setIsOpen(true);
  };

  return (
    <div className={className || "space-y-4 pt-4"}>
      <CropInterestSheet isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-base font-bold lg:text-xl">{title}</p>
          <Button
            className="text-primary hidden h-[36px] rounded-full bg-[#F5F5F5] font-bold text-[#002D2B] hover:bg-[#F5F5F5] hover:text-[#002D2B] md:flex"
            onClick={onEditInterest}
          >
            <IconPencil className="size-4" /> Edit crop interest
          </Button>

          <Button
            className="text-primary flex h-[36px] rounded-full bg-[#F5F5F5] font-bold text-[#002D2B] hover:bg-[#F5F5F5] hover:text-[#002D2B] md:hidden"
            onClick={onEditInterest}
          >
            <IconPencil className="size-4" /> Edit
          </Button>
        </div>

        <Button
          variant="link"
          className="text-primary hidden text-base md:flex"
          onClick={onSeeAll}
        >
          See all crops <IconArrowRight className="!size-5" />
        </Button>
        <Button
          variant="link"
          className="text-primary flex text-base md:hidden"
          onClick={onSeeAll}
        >
          See all <IconArrowRight className="!size-5" />
        </Button>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="hidden h-[36px] w-[190px] min-w-[137px] rounded-full border-0 bg-[#F5F5F5] focus:ring-0 focus:ring-offset-0 lg:flex">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="Roots and tubers">Roots and tubers</SelectItem>
            <SelectItem value="Fruits and vegetables">
              Fruits and vegetables
            </SelectItem>
          </SelectContent>
        </Select>

        <CropFilterSheet />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--text-dark))]" />
          <Input
            type="search"
            placeholder="Search crop"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="transition-color focus-visible:border-primary h-[36px] min-w-min rounded-full border-0 bg-[#F5F5F5] pl-10 focus-visible:border focus-visible:ring-0 focus-visible:ring-offset-0 md:w-[451px]"
          />
        </div>
      </div>
    </div>
  );
}
