"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui/components/form";
import { Input } from "@cf/ui/components/input";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "../utils/cn";

interface FormDateInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control: Control<TFieldValues>;
  label?: string;
  required?: boolean;
  className?: string;
  bgColor?: string;
}

export function FormDateInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  required,
  className,
  bgColor,
}: FormDateInputProps<TFieldValues, TName>) {
  const bgColorMap: Record<string, string> = {
    "bg-userDropdown-background": "bg-userDropdown-background",
    "bg-primary-light": "bg-primary-light",
  };
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const formatValueForInput = (val?: string): string => {
          if (!val?.includes("/")) return "";
          const [dd, mm, yyyy] = val.split("/");
          if (!dd || !mm || !yyyy) return "";
          return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
        };

        const formatValueForForm = (val: string): string => {
          const [yyyy, mm, dd] = val.split("-");
          if (!yyyy || !mm || !dd) return "";
          return `${dd}/${mm}/${yyyy}`;
        };

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className="relative">
                <Input
                  type="date"
                  {...field}
                  onChange={(e) =>
                    field.onChange(formatValueForForm(e.target.value))
                  }
                  value={formatValueForInput(field.value)}
                  className={cn(
                    "h-12 w-full rounded-lg border border-input-border px-3 text-sm [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                    bgColor ? bgColorMap[bgColor] : "bg-primary-light",
                  )}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
