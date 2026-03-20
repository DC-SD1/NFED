"use client";

import {
  Button,
  Calendar,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cf/ui";
import { format } from "date-fns";
import {Calendar as CalendarIcon, ChevronDown} from "lucide-react";
import React from "react";

interface Props {
  onChanged: (date: Date | undefined) => void;
  value?: Date;
  className?: string;
  placeholder?: string;
}

export function DatePicker({
  onChanged,
  value,
  className,
  placeholder,
}: Props) {
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    onChanged(newDate);
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild className={cn("bg-input focus:ring-ring h-10 focus:outline-none focus:ring-2", className)}>
        <Button
          variant={"outline"}
          className={cn(
            "bg-input hover:bg-input text-foreground hover:text-foreground w-full justify-between text-left font-normal",
          )}
        >
          <div className={'flex items-center gap-2'}>
            <CalendarIcon className="size-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </div>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="label"
          selected={date}
          onSelect={handleDateChange}
        />
      </PopoverContent>
    </Popover>
  );
}
