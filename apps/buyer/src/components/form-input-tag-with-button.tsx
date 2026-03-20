import { Button } from "@cf/ui";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui/components/form";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";

export interface FormInputTagWithButtonProps {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  className?: string;
}

export function FormInputTagWithButton({
  name,
  label,
  description,
  placeholder,
  className,
}: FormInputTagWithButtonProps) {
  const { control } = useFormContext();
  const [inputValue, setInputValue] = useState("");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const tags = Array.isArray(field.value) ? field.value : [];

        const handleAdd = () => {
          if (!inputValue.trim()) return;

          const newTags = inputValue
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);

          if (newTags.length > 0) {
            const uniqueTags = [...new Set([...tags, ...newTags])];
            field.onChange(uniqueTags);
            setInputValue("");
          }
        };

        const handleRemove = (indexToRemove: number) => {
          const updatedTags = tags.filter(
            (_: string, index: number) => index !== indexToRemove,
          );
          field.onChange(updatedTags);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        };

        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <InputGroup className="h-12 bg-primary-light">
                  <InputGroupInput
                    placeholder={placeholder}
                    className="h-12 placeholder:text-[#525C4E] focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <InputGroupAddon align="inline-end" className="">
                    <InputGroupButton
                      variant="ghost"
                      type="button"
                      className="font-bold hover:bg-transparent hover:text-black"
                      onClick={handleAdd}
                    >
                      Add
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, index: number) => (
                      <div
                        key={index}
                        className="flex h-[32px] w-fit items-center justify-center gap-2 rounded-md bg-[#F5F5F5] px-3"
                      >
                        <p>{tag}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemove(index)}
                          className="h-auto w-auto cursor-pointer p-0 text-[#8F0004] transition-opacity hover:bg-transparent hover:text-[#8F0004] hover:opacity-70"
                        >
                          <IconX className="!size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
