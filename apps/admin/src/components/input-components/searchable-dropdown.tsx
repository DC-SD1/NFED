"use client";

import {
  Button,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cf/ui";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";

import type { OptionProps } from "@/types/common.types";

interface SearchableDropdown {
  placeholder?: string;
  searchPlaceholder?: string;
  options: OptionProps[];
  onValueChange?: (option: OptionProps) => void;
  error?: string;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  renderValue?: (option?: OptionProps) => React.ReactNode;
  renderDropdownItem?: (option: OptionProps) => React.ReactNode;
  notFoundText?: string | React.ReactNode;
  placeholderTextColor?: string;
  valueTextColor?: string;
  helperText?: string;
  contentClassName?: string;
  searchOuterClassName?: string;
  menuItemClassName?: string;
  onFetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  valueTextClassName?: string;
  innerTriggerClassName?: string;
}

export function SearchableDropdown({
  className,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
  onValueChange,
  renderDropdownItem,
  renderValue,
  notFoundText,
  defaultValue,
  placeholderTextColor,
  valueTextColor,
  contentClassName,
  searchOuterClassName,
  menuItemClassName,
  onFetchNextPage,
  isFetchingNextPage,
  valueTextClassName,
  innerTriggerClassName,
}: SearchableDropdown) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue ?? "");
  const previousScrollTopRef = React.useRef<any>();

  // This is to make sure that value is set when parent component set it after child(this) component is mounted already
  useEffect(() => {
    setValue(defaultValue ?? "");
  }, [defaultValue]);

  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

      if (previousScrollTopRef.current !== undefined) {
        const isScrollingDown = scrollTop > previousScrollTopRef.current;

        // If scrolling down AND near the bottom (within 10px)
        if (
          isScrollingDown &&
          scrollHeight - scrollTop - clientHeight < 10 &&
          scrollTop > 48
        ) {
          onFetchNextPage?.();
        }
      }

      // Update previous scroll position
      previousScrollTopRef.current = scrollTop;
    },
    [onFetchNextPage],
  );

  return (
    <div className={cn("w-full")}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          className={cn("border-input-border bg-input w-full", className)}
          asChild
        >
          <Button
            variant="outline"
            role="combobox"
            size="sm"
            aria-expanded={open}
            className={cn(
              "border-input-border bg-input hover:bg-input hover:text-foreground h-10 w-full justify-between gap-2 font-normal",
              innerTriggerClassName,
            )}
          >
            {renderValue ? (
              renderValue(
                options.find((framework) => framework.value === value),
              )
            ) : (
              <p
                className={cn(
                  `truncate text-sm ${value ? valueTextColor : (placeholderTextColor ?? "text-foreground")}`,
                  valueTextClassName,
                )}
              >
                {value
                  ? options.find((framework) => framework.value === value)
                      ?.label
                  : placeholder}
              </p>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 opacity-50 transition-transform",
                open && "rotate-180",
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align={"start"}
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0",
            contentClassName,
          )}
        >
          <Command className={`w-full`}>
            <CommandInput
              placeholder={searchPlaceholder ?? placeholder}
              className={"border-input-border bg-input h-8 py-2"}
              outerClassName={cn(
                "border-input-border bg-input mx-4 mb-2 mt-4 rounded-md",
                searchOuterClassName,
              )}
            />
            <CommandList className="pb-4" onScroll={handleScroll}>
              <CommandEmpty>{notFoundText ?? "No Results"}</CommandEmpty>
              <CommandGroup>
                {options.map((option, index) => (
                  <CommandItem
                    className={cn(
                      "data-[selected='true']:bg-btn-hover data-[selected=true]:text-foreground !my-3.5 flex items-center justify-between",
                      menuItemClassName,
                    )}
                    key={index}
                    value={option.label}
                    onSelect={(currentValue) => {
                      const selectedOption = options.find(
                        (opt) => opt.label === currentValue,
                      );
                      if (selectedOption) {
                        setValue(selectedOption.value);
                        onValueChange?.(selectedOption);
                        setOpen(false);
                      }
                    }}
                  >
                    {renderDropdownItem
                      ? renderDropdownItem(option)
                      : option.label}
                    <Check
                      className={cn(
                        "ml-2 size-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              {isFetchingNextPage && (
                <div className="flex items-center justify-center pt-2">
                  <Loader2 className="animate-spin" />
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
