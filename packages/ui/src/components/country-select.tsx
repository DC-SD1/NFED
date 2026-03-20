import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import type * as RPNInput from "react-phone-number-input";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { cn } from "../utils/cn";
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
import { ScrollArea } from "./scroll-area";

interface CountrySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showFlag?: boolean;
  showCallingCode?: boolean;
}

const CountrySelect = React.forwardRef<
  React.ElementRef<typeof Button>,
  CountrySelectProps
>(
  (
    {
      value,
      onValueChange,
      placeholder = "Select country...",
      disabled = false,
      className,
      showFlag = true,
      showCallingCode = false,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

    // Get all countries from react-phone-number-input
    const countries = React.useMemo(() => {
      return getCountries()
        .map((countryCode) => {
          const countryName = new Intl.DisplayNames(["en"], {
            type: "region",
          }).of(countryCode);

          return {
            code: countryCode,
            name: countryName ?? countryCode,
            callingCode: getCountryCallingCode(countryCode),
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    // Find selected country
    const selectedCountry = React.useMemo(() => {
      return countries.find((country) => country.name === value);
    }, [countries, value]);

    // Filter countries based on search
    const filteredCountries = React.useMemo(() => {
      if (!searchValue) return countries;
      return countries.filter((country) =>
        country.name.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }, [countries, searchValue]);

    const handleSelect = (countryName: string) => {
      onValueChange?.(countryName);
      setIsOpen(false);
      setSearchValue("");
    };

    const FlagComponent = ({ countryCode }: { countryCode: string }) => {
      const Flag = flags[countryCode as RPNInput.Country];
      return (
        <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
          {Flag && <Flag title={countryCode} />}
        </span>
      );
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="unstyled"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between text-left font-normal",
              !value && "text-muted-foreground",
              className,
            )}
            disabled={disabled}
            {...props}
          >
            <div className="flex items-center gap-2">
              {selectedCountry && showFlag && (
                <FlagComponent countryCode={selectedCountry.code} />
              )}
              <span className="truncate">
                {selectedCountry ? (
                  <span className="flex items-center gap-2">
                    {selectedCountry.name}
                    {showCallingCode && (
                      <span className="text-muted-foreground">
                        (+{selectedCountry.callingCode})
                      </span>
                    )}
                  </span>
                ) : (
                  placeholder
                )}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search countries..."
              value={searchValue}
              onValueChange={(value) => {
                setSearchValue(value);
                // Reset scroll position when searching
                setTimeout(() => {
                  if (scrollAreaRef.current) {
                    const viewportElement = scrollAreaRef.current.querySelector(
                      "[data-radix-scroll-area-viewport]",
                    );
                    if (viewportElement) {
                      viewportElement.scrollTop = 0;
                    }
                  }
                }, 0);
              }}
            />
            <CommandList>
              <ScrollArea ref={scrollAreaRef} className="h-72">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {filteredCountries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.name}
                      onSelect={() => handleSelect(country.name)}
                      className="flex items-center gap-2"
                    >
                      {showFlag && <FlagComponent countryCode={country.code} />}
                      <span className="flex-1">{country.name}</span>
                      {showCallingCode && (
                        <span className="text-sm text-muted-foreground">
                          +{country.callingCode}
                        </span>
                      )}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedCountry?.code === country.code
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

CountrySelect.displayName = "CountrySelect";

export { CountrySelect };
