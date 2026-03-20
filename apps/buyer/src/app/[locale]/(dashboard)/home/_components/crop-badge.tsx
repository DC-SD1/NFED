import { IconPlant2, IconX } from "@tabler/icons-react";

interface CropBadgeProps {
  name: string;
  onRemove: () => void;
}

export function CropBadge({ name, onRemove }: CropBadgeProps) {
  return (
    <div className="flex h-[36px] w-fit items-center justify-center gap-2 rounded-full bg-[#F5F5F5] px-3 text-sm">
      <IconPlant2 className="!size-4" />
      <p>{name}</p>
      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer transition-opacity hover:opacity-70"
      >
        <IconX className="!size-4" />
      </button>
    </div>
  );
}
