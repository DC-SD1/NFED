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
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { useState } from "react";

export interface QuerySearchableDropdownOption {
  value: string;
  label: string;

  [key: string]: any;
}

export interface QuerySearchableDropdown {
  placeholder?: string;
  options: QuerySearchableDropdownOption[];
  onValueChange?: (option: QuerySearchableDropdownOption) => void;
  innerTriggerClassName?: string;
  defaultValue?: string;
  disabled?: boolean;
  renderValue?: (option?: QuerySearchableDropdownOption) => React.ReactNode;
  renderDropdownItem?: (
    option: QuerySearchableDropdownOption,
  ) => React.ReactNode;
  notFoundText?: string | React.ReactNode;
  placeholderTextColor?: string;
  valueTextColor?: string;
  className?: string;
  searchOuterClassName?: string;
  menuItemClassName?: string;
  valueTextClassName?: string;
  contentClassName?: string;
  searchPlaceholder?: string;
  isSearchLoading?: boolean;
  searchTerm?: string;
  onSearchTerm?: (value: string) => void;
}

export function QuerySearchableDropdown({
  innerTriggerClassName,
  options,
  placeholder,
  disabled,
  onValueChange,
  renderDropdownItem,
  renderValue,
  notFoundText,
  defaultValue,
  placeholderTextColor,
  valueTextColor,
  className,
  searchOuterClassName,
  menuItemClassName,
  valueTextClassName,
  searchPlaceholder,
  contentClassName,
  isSearchLoading = false,
  searchTerm,
  onSearchTerm,
}: QuerySearchableDropdown) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");

  const selectedOption = options.find((option) => option.value === value);

  const handleItemSelect = (option: QuerySearchableDropdownOption) => {
    setValue(option.value);
    onValueChange?.(option);
    setOpen(false);
  };

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
            aria-expanded={open}
            className={cn(
              "border-input-border bg-input hover:bg-input hover:text-foreground h-10 w-full justify-between gap-2 font-normal",
              innerTriggerClassName,
            )}
          >
            {renderValue ? (
              renderValue(selectedOption)
            ) : (
              <span
                className={cn(
                  "truncate text-sm",
                  selectedOption
                    ? valueTextColor ?? "text-slate-900"
                    : placeholderTextColor ?? "text-slate-500",
                  valueTextClassName,
                )}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
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
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0",
            contentClassName,
          )}
        >
          <Command shouldFilter={false} className={"w-full"}>
            <CommandInput
              placeholder={searchPlaceholder ?? placeholder}
              className={"border-input-border bg-input h-8 py-2"}
              outerClassName={cn(
                "border-input-border bg-input mx-4 mb-2 mt-4 rounded-md",
                searchOuterClassName,
              )}
              value={searchTerm}
              onValueChange={(search) => onSearchTerm?.(search)}
            />
            <CommandList className="pb-4">
              {isSearchLoading ? (
                <div
                  className={"flex justify-center py-8 text-sm text-slate-500"}
                >
                  Searching...
                </div>
              ) : options.length === 0 ? (
                <CommandEmpty
                  className={"py-6 text-center text-sm text-slate-500"}
                >
                  {notFoundText ?? "No Results"}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {options.map((option, index) => (
                    <CommandItem
                      className={cn(
                        "data-[selected='true']:bg-btn-hover data-[selected=true]:text-foreground !my-3.5 flex items-center justify-between",
                        menuItemClassName,
                      )}
                      key={index}
                      value={option.label}
                      onSelect={(_) => handleItemSelect(option)}
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
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
