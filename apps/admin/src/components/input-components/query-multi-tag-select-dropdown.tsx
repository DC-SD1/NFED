"use client";

import {
  Button,
  Checkbox,
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
import { IconCircleXFilled } from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";

import type { OptionProps } from "@/types/common.types";

interface Props {
  placeholder?: string;
  searchPlaceholder?: string;
  options: OptionProps[];
  onValueChange?: (selectedOptions: OptionProps[]) => void;
  error?: string;
  className?: string;
  defaultValues?: string[];
  disabled?: boolean;
  renderValue?: (option?: OptionProps[]) => React.ReactNode;
  renderDropdownItem?: (option: OptionProps) => React.ReactNode;
  notFoundText?: string | React.ReactNode;
  placeholderTextColor?: string;
  helperText?: string;
  contentClassName?: string;
  searchOuterClassName?: string;
  menuItemClassName?: string;
  innerTriggerClassName?: string;
  countSuffix?: string;
  isSearchLoading?: boolean;
  searchTerm?: string;
  onSearchTerm?: (value: string) => void;
}

export function QueryMultiTagSelectDropdown({
  className,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
  onValueChange,
  renderDropdownItem,
  renderValue,
  notFoundText,
  defaultValues,
  placeholderTextColor,
  contentClassName,
  searchOuterClassName,
  menuItemClassName,
  innerTriggerClassName,
  countSuffix,
  isSearchLoading = false,
  searchTerm,
  onSearchTerm,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<string[]>(defaultValues ?? []);

  // This is to make sure that value is set when parent component set it after child(this) component is mounted already
  useEffect(() => {
    setValues(defaultValues ?? []);
  }, [defaultValues]);

  const toggleItem = (optionValue: string) => {
    const newSelectedValues = values.includes(optionValue)
      ? values.filter((v) => v !== optionValue)
      : [...values, optionValue];

    setValues(newSelectedValues);

    const selectedOptions = options.filter((opt) =>
      newSelectedValues.includes(opt.value),
    );
    onValueChange?.(selectedOptions);
  };

  const removeItem = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelectedValues = values.filter((v) => v !== value);
    setValues(newSelectedValues);

    const selectedOptions = options.filter((opt) =>
      newSelectedValues.includes(opt.value),
    );
    onValueChange?.(selectedOptions);
  };

  const handleCancel = () => {
    setValues([]);
    onValueChange?.([]);
    setOpen(false);
  };

  const handleAdd = () => {
    setOpen(false);
  };

  const selectedOptions = options.filter((opt) => values.includes(opt.value));

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
              "border-input-border bg-input hover:bg-input hover:text-foreground h-auto min-h-10 w-full justify-between gap-2 font-normal",
              innerTriggerClassName,
            )}
          >
            {renderValue ? (
              renderValue(selectedOptions)
            ) : (
              <RenderValueComponent
                options={selectedOptions}
                removeItem={removeItem}
                placeholderTextColor={placeholderTextColor}
                placeholder={placeholder}
              />
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
          <Command shouldFilter={false} className={`w-full`}>
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
                      onSelect={() => toggleItem(option.value)}
                    >
                      {renderDropdownItem
                        ? renderDropdownItem(option)
                        : option.label}

                      {values.includes(option.value) ? (
                        <Checkbox checked />
                      ) : (
                        <Checkbox className={"border-input-border"} />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>

          <div className={"mb-4 mr-4 flex justify-end gap-2.5"}>
            <Button
              variant="secondary"
              size="sm"
              className="text-success-secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleAdd}
              disabled={selectedOptions.length === 0}
            >
              {selectedOptions.length === 0
                ? `Add ${countSuffix ?? ""}`
                : `Add ${selectedOptions.length} ${countSuffix ?? ""}`}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface RenderProps {
  options: OptionProps[];
  removeItem: (value: string, e: React.MouseEvent) => void;
  placeholderTextColor?: string;
  placeholder?: string;
}

const RenderValueComponent = ({
  options,
  removeItem,
  placeholderTextColor,
  placeholder,
}: RenderProps) => {
  if (options.length === 0) {
    return (
      <span className={cn("text-sm", placeholderTextColor ?? "text-gray-500")}>
        {placeholder}
      </span>
    );
  }

  return (
    <div className="flex flex-1 flex-wrap gap-1.5">
      {options.map((option) => (
        <span
          key={option.value}
          className="inline-flex items-center gap-1.5 rounded-md border bg-white py-1 pl-2 pr-1 text-sm"
        >
          {option.label}
          <div
            tabIndex={-1}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && e.stopPropagation()
            }
            role={"button"}
            onClick={(e) => removeItem(option.value, e)}
            className={"p-1"}
          >
            <IconCircleXFilled className={"size-4"} />
          </div>
        </span>
      ))}
    </div>
  );
};
