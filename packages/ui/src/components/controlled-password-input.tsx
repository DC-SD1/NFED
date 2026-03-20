"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { FormMessage } from "./form";
import { PasswordInput } from "./password-input";

interface ControlledPasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<
    React.ComponentPropsWithoutRef<typeof PasswordInput>,
    "value" | "onChange" | "error"
  > {
  name: TName;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
}

export function ControlledPasswordInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  ...props
}: ControlledPasswordInputProps<TFieldValues, TName>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <PasswordInput
            {...field}
            {...props}
            label={label}
            description={description}
            error={!!fieldState.error}
          />
          {fieldState.error && (
            <FormMessage>{fieldState.error.message}</FormMessage>
          )}
        </div>
      )}
    />
  );
}
