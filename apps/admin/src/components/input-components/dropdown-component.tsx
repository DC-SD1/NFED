"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cf/ui";
import clsx from "clsx";
import * as React from "react";

import type { OptionProps } from "@/types/common.types";

interface DropdownComponentProps {
  placeholder?: string;
  options: OptionProps[];
  onValueChange?: (value: string) => void;
  label?: string;
  name?: string;
  id?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  contentClassName?: string;
  value?: string;
  renderLabel?: (option: OptionProps) => React.ReactNode;
  onAddNewClick?: () => void;
  renderValue?: (option?: OptionProps) => React.ReactNode;
}

export function DropdownComponent({
  placeholder,
  options,
  onValueChange,
  name,
  id,
  required,
  className,
  defaultValue,
  disabled,
  contentClassName,
  value,
  renderLabel,
  onAddNewClick,
  renderValue,
}: DropdownComponentProps) {
  const [safeDefaultValue, setSafeDefaultValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (options.some((opt) => opt.value === defaultValue)) {
      setSafeDefaultValue(defaultValue);
    } else {
      setSafeDefaultValue(undefined);
    }
  }, [defaultValue, options]);

  return (
    <Select
      onValueChange={(value) => {
        if (value === "add-new") {
          onAddNewClick?.();
          onValueChange?.("");
        } else {
          onValueChange?.(value);
        }
      }}
      defaultValue={safeDefaultValue}
      disabled={disabled}
      name={name}
      required={required}
      value={value}
    >
      <SelectTrigger
        className={clsx("bg-input w-full truncate", className)}
        id={id}
      >
        {renderValue ? (
          renderValue(
            options.find((framework) => framework.value === safeDefaultValue),
          )
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent
        className={clsx(
          "rounded-lg shadow-[0px_20px_25px_-5px_rgba(22,29,20,0.10)]",
          contentClassName,
        )}
      >
        {onAddNewClick && (
          <SelectGroup className={"mb-2"}>
            <SelectItem
              className="focus:bg-btn-hover focus:text-foreground"
              value="add-new"
            >
              Add New
            </SelectItem>
          </SelectGroup>
        )}
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              iconAlign="right"
              className={
                "focus:bg-btn-hover focus:text-foreground !my-3.5 pl-2 pr-8"
              }
            >
              {renderLabel ? renderLabel(option) : option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default DropdownComponent;
