"use client";

import React, { useEffect, useRef, useState } from "react";
import AutoComplete from "react-google-autocomplete";

const PLACES_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;

export interface LocationProps {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface LocationInputProps {
  label?: string;
  id: string;
  onChanged?: (location: LocationProps, id?: string) => void;
  placeholder?: string;
  countryToFilterFrom?: string;
  defaultValue?: string;
}

const LocationInput = ({
  label,
  id,
  onChanged,
  placeholder,
  countryToFilterFrom = "gh",
  defaultValue,
}: LocationInputProps) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (focused && inputRef.current) {
      inputRef.current?.focus();
    }
  }, [focused]);

  const handleInputClick = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={label} className="text-sm font-medium leading-[18px]">
          {label}
        </label>
      )}
      <AutoComplete
        id={id}
        onClick={handleInputClick}
        onBlur={handleBlur}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChanged?.(
            {
              address: e.target.value,
              coordinates: {
                latitude: 0,
                longitude: 0,
              },
            },
            id,
          );
        }}
        defaultValue={defaultValue}
        placeholder={placeholder}
        options={{
          types: ["geocode", "establishment"],
          componentRestrictions: { country: countryToFilterFrom },
        }}
        onPlaceSelected={(place) => {
          onChanged?.(
            {
              address: place?.formatted_address ?? "",
              coordinates: {
                latitude: place?.geometry?.location?.lat() || 0,
                longitude: place?.geometry?.location?.lng() || 0,
              },
            },
            id,
          );
        }}
        apiKey={PLACES_KEY}
        className="relative h-10 w-full rounded-md border border-none bg-primary-light px-3 py-2 pr-12 text-sm ring-offset-background file:border-0 placeholder:text-[#525C4E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
};

export default LocationInput;
