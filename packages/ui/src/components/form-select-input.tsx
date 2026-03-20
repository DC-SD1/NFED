"use client";

import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cf/ui";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui/components/form";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";

import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface Option {
  label: string;
  value: string;
}

interface FormSelectInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: string;
  placeholder?: string;
  options: Option[];
  required?: boolean;
  className?: string;
  border?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export function FormSelectInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  options,
  required,
  className,
  placeholder,
  border = false,
  searchable = false,
  searchPlaceholder = "Search...",
  disabled = false,
}: FormSelectInputProps<TFieldValues, TName>) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          {label && (
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            {searchable ? (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                      "h-12 w-full justify-between bg-primary-light text-left font-normal hover:bg-primary-light hover:text-foreground",
                      border ? "border" : "border-none",
                      !field.value && "text-muted-foreground",
                      disabled && "cursor-not-allowed opacity-50",
                      className,
                    )}
                  >
                    {field.value
                      ? options.find((option) => option.value === field.value)
                          ?.label
                      : placeholder}
                    <ChevronDown
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0 opacity-50",
                        open ? "rotate-180" : "",
                      )}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-max p-0" align="start">
                  <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                      <CommandEmpty>No option found.</CommandEmpty>
                      <CommandGroup>
                        {options.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={(currentValue) => {
                              field.onChange(
                                currentValue === field.value
                                  ? ""
                                  : currentValue,
                              );
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === option.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <Select
                key={field.value ?? "__empty"}
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      "placeholder:text-placeholder-text h-12 bg-primary-light",
                      border ? "border" : "border-none",
                      disabled && "cursor-not-allowed opacity-50",
                      className,
                    )}
                  >
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={cn("py-2.5", className)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormControl>
          <FormMessage className="text-xs font-normal" />
        </FormItem>
      )}
    />
  );
}
