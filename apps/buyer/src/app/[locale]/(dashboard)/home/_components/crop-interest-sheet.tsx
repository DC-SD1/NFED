import {
  Button,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@cf/ui";
import { X } from "lucide-react";
import { useState } from "react";

import { cropInterests } from "./constants";
import { CropBadge } from "./crop-badge";
import { CropCard } from "./crop-card";

export function CropInterestSheet({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const [typedCrops, setTypedCrops] = useState<string[]>(["Wheat"]);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        const newCrops = inputValue
          .split(",")
          .map((crop) => crop.trim())
          .filter((crop) => crop && !typedCrops.includes(crop));

        if (newCrops.length > 0) {
          setTypedCrops([...typedCrops, ...newCrops]);
          setInputValue("");
        }
      }
    }
  };

  const removeCrop = (cropToRemove: string) => {
    setTypedCrops(typedCrops.filter((crop) => crop !== cropToRemove));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        className="h-auto w-full overflow-y-auto lg:min-w-[824px]"
        hideCloseButton
      >
        <SheetHeader className="relative mx-auto w-full lg:w-[744px]">
          <Button
            variant="ghost"
            size="icon"
            className="fixed right-2 top-2 size-6 rounded-full bg-[#F5F5F5] text-[#161D1D] hover:bg-[#F5F5F5] lg:size-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="!size-5" />
            <span className="sr-only">Close</span>
          </Button>
          <SheetTitle className="text-2xl">Editing crop interest</SheetTitle>
          <SheetDescription className="text-sm text-[#586665]">
            Kindly select all crops that interest you.
          </SheetDescription>
        </SheetHeader>
        <div className="mx-auto mt-10 w-full space-y-8 lg:w-[744px]">
          {cropInterests.map((crop) => (
            <div className="space-y-6" key={crop.label}>
              <Label className="text-xl font-bold">{crop.label}</Label>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {crop.products.map((product) => (
                  <CropCard
                    key={product.id}
                    imageSrc={product.image}
                    name={product.name}
                    category={product.category}
                    onRemove={() => console.log("Remove crop", product.name)}
                    buttonLabel={crop.buttonLabel}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-4">
            <Label className="text-xl font-bold">Typed crops</Label>
            <div className="flex flex-wrap items-center gap-2">
              {typedCrops.map((crop) => (
                <CropBadge
                  key={crop}
                  name={crop}
                  onRemove={() => removeCrop(crop)}
                />
              ))}
            </div>

            <Textarea
              className="h-[74px] w-full rounded-xl border border-[hsl(var(--border-light))] bg-[#F5F5F5] placeholder:text-xs lg:h-[126px] lg:placeholder:text-sm"
              placeholder="Didn’t find a crop that interest you, type them here and separate with a comma (,)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <SheetFooter className="my-6 w-full lg:w-[744px]">
          <Button
            type="submit"
            className="h-[56px] w-[213px] rounded-xl text-base"
          >
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
