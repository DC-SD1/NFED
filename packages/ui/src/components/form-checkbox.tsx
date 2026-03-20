"use client";

import type { CheckedState } from "@radix-ui/react-checkbox";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { cn } from "../utils/cn";
import { Checkbox } from "./checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

interface FormCheckboxProps {
  name: string;
  label: string | ReactNode;
  className?: string;
}

export function FormCheckbox({ name, label, className }: FormCheckboxProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center gap-5">
          <FormControl>
            <Checkbox
              className={cn("w-5 h-5", className)}
              checked={field.value === true}
              onCheckedChange={(checked: CheckedState) => {
                field.onChange(checked === true);
              }}
            />
          </FormControl>
          <FormLabel className="font-normal">{label}</FormLabel>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
