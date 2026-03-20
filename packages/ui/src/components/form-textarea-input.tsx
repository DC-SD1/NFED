"use client";

import { useFormContext } from "react-hook-form";

import { cn } from "../utils/cn";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Textarea } from "./textarea";

interface FormTextareaInputProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  rows?: number | undefined;
  maxLength?: number | undefined;
  disabled?: boolean;
}

export function FormTextareaInput({
  name,
  label,
  description,
  placeholder,
  className,
  rows,
  maxLength,
  disabled = false,
}: FormTextareaInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              maxLength={maxLength}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "placeholder:text-xs md:placeholder:text-sm placeholder:text-placeholder-text resize-none border-none bg-primary-light",
                disabled && "opacity-50 cursor-not-allowed",
                className,
              )}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
