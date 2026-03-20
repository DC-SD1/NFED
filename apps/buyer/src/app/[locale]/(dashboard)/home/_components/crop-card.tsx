"use client";

import { Button } from "@cf/ui";
import Image from "next/image";

interface CropCardProps {
  imageSrc: string;
  name: string;
  category: string;
  onRemove: () => void;
  buttonLabel: string;
}

export function CropCard({
  imageSrc,
  name,
  category,
  onRemove,
  buttonLabel,
}: CropCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <div className="relative size-[48px] rounded-xl bg-[#F6FBFB]">
          <Image src={imageSrc} alt={name} fill className="object-contain" />
        </div>
        <div>
          <p>{name}</p>
          <p className="text-sm text-[#586665]">{category}</p>
        </div>
      </div>

      <Button
        className="h-[36px] rounded-xl bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5]"
        onClick={onRemove}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
