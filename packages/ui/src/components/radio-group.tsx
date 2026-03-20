"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "../utils/cn";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("space-y-3", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: string;
  selected: boolean;
  itemClassName?: string;
  labelClassName?: string;
  radioClassName?: string;
  selectedBackgroundClass?: string;
  unselectedBackgroundClass?: string;
  selectedBorderClass?: string;
  unselectedBorderClass?: string;
  selectedRadioClass?: string;
  unselectedRadioClass?: string;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(
  (
    {
      label,
      selected,
      value,
      itemClassName,
      labelClassName,
      radioClassName,
      selectedBackgroundClass,
      unselectedBackgroundClass,
      selectedBorderClass,
      unselectedBorderClass,
      selectedRadioClass,
      unselectedRadioClass,
      ...props
    },
    ref,
  ) => {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value}
        className={cn(
          "relative flex w-full cursor-pointer items-start gap-1 rounded-xl border p-4 text-left",
          selected
            ? cn(
                selectedBackgroundClass ?? "bg-primary/5",
                selectedBorderClass ?? "border-primary",
              )
            : cn(
                unselectedBackgroundClass ?? "bg-card",
                unselectedBorderClass ?? "border-muted-foreground/20",
              ),
          itemClassName,
        )}
        {...props}
      >
        <div className="flex-1 pl-8">
          <p className={cn("text-sm font-medium", labelClassName)}>{label}</p>
        </div>

        <div
          className={cn(
            "absolute left-4 top-4 flex size-5 items-center justify-center rounded-full border",
            selected
              ? cn(selectedRadioClass ?? "bg-primary border-primary text-white")
              : cn(unselectedRadioClass ?? "border-gray-300"),
            radioClassName,
          )}
        >
          {selected && <Check size={12} />}
        </div>
      </RadioGroupPrimitive.Item>
    );
  },
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
