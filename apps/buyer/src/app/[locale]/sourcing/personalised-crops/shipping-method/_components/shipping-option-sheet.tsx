import {
  Button,
  Checkbox,
  cn,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@cf/ui";
import { IconCheck, IconChevronRight } from "@tabler/icons-react";

interface SheetOptionMeta {
  title: string;
  description: string;
  optionType: "icon" | "checkbox";
  items: string[];
}

export interface ShippingOptionEntry {
  title: string;
  type: string;
  selectedCount?: number;
  sheetOptions: SheetOptionMeta;
}

interface ShippingOptionSheetProps {
  option: ShippingOptionEntry;
}

export function ShippingOptionSheet({ option }: ShippingOptionSheetProps) {
  const { sheetOptions } = option;
  const selectionCount = option.selectedCount ?? sheetOptions.items.length;
  const isCheckboxList = sheetOptions.optionType === "checkbox";
  const hasCompactItems =
    isCheckboxList &&
    sheetOptions.items.some((item) => item.trim().length <= 32);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex h-[56px] w-full items-center justify-between rounded-xl bg-[hsl(var(--background-light))] px-4 text-left transition-all duration-300 hover:bg-[#F1FBFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-1">
            <p className="font-normal text-[#161D1D]">{option.title}</p>
            {isCheckboxList && (
              <p className="font-bold">
                ({selectionCount} item{selectionCount === 1 ? "" : "s"}{" "}
                selected)
              </p>
            )}
          </div>
          <IconChevronRight className="!size-5" />
        </button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col overflow-y-auto lg:min-w-[640px]">
        <SheetHeader className="h-[84px] space-y-2">
          <SheetTitle className="text-[28px] font-bold leading-[36px]">
            {sheetOptions.title}
          </SheetTitle>
          <SheetDescription className="text-sm text-[#586665]">
            {sheetOptions.description}
          </SheetDescription>
        </SheetHeader>
        <div
          className={cn(
            "flex-1 overflow-y-auto",
            isCheckboxList ? "flex flex-wrap content-start gap-3" : "space-y-2",
          )}
        >
          {sheetOptions.items.map((item, index) => {
            if (isCheckboxList) {
              const checkboxId = `${option.type}-${index}`;
              const isCompactItem = item.trim().length <= 32;
              return (
                <label
                  key={item}
                  htmlFor={checkboxId}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border border-transparent bg-white p-3 text-sm text-[#161D1D] transition hover:border-[#D5E3FD]",
                    isCompactItem && hasCompactItems
                      ? "min-w-[240px] flex-1"
                      : "basis-full",
                  )}
                >
                  <Checkbox
                    id={checkboxId}
                    defaultChecked={index < selectionCount}
                  />
                  <span>{item}</span>
                </label>
              );
            }

            return (
              <div
                key={item}
                className="flex h-[40px] items-center gap-3 rounded-lg bg-[hsl(var(--background-light))] p-3 text-sm text-[#161D1D]"
              >
                <IconCheck className="!size-4 text-[hsl(var(--success))]" />
                <p>{item}</p>
              </div>
            );
          })}
        </div>
        {isCheckboxList && (
          <SheetFooter className="mt-auto">
            <Button type="button" className="h-[48px] w-[115px] rounded-xl">
              Update
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
