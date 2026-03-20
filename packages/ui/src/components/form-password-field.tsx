"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";

import { cn } from "../utils/cn";
import { Button } from "./button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";

// ToDO: Add more fields such as labelClassName, description, descriptionClassName, required, etc.

interface FormPasswordFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label: string;
  placeholder: string;
  autoComplete?: string;
  className?: string;
}

export function FormPasswordField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  placeholder,
  autoComplete = "new-password",
  className,
}: FormPasswordFieldProps<TFieldValues, TName>) {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                className={cn(
                  "bg-primary-light border-none placeholder:text-[#586665] focus-visible:ring-primary h-12 focus-visible:ring-1",
                  className,
                )}
                // Use system fonts for password bullets due to browser rendering limitations
                // with custom fonts. Cera Pro's vertical metrics don't apply to browser-generated
                // password masking characters, causing them to appear smaller than expected.
                style={
                  !showPassword
                    ? {
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }
                    : undefined
                }
                autoComplete={autoComplete}
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, "");
                  field.onChange(value);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 h-auto -translate-y-1/2 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="text-foreground size-5" />
                ) : (
                  <Eye className="text-foreground size-5" />
                )}
              </Button>
            </div>
          </FormControl>
          <FormMessage className="font-normal text-xs" />
        </FormItem>
      )}
    />
  );
}
