"use client";

import { Badge } from "@cf/ui";
import { IconWorldPin } from "@tabler/icons-react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ParserBuilder, SetValues } from "nuqs";
import React from "react";

import FlagComponent from "@/components/common/flag-component";
import DateRangePicker from "@/components/input-components/date-range-picker";
import { SearchableDropdown } from "@/components/input-components/searchable-dropdown";
import { useCountries } from "@/hooks/use-countries";

interface Props {
  selectedFilters: {
    from: Date | null;
    to: Date | null;
    country: string;
  };
  setSelectedFilters: SetValues<{
    from: ParserBuilder<Date>;
    to: ParserBuilder<Date>;
    country: Omit<ParserBuilder<string>, "parseServerSide"> & {
      parseServerSide: (value: string) => string;
    };
  }>;
}

export default function BuyerFilterToolbar({
  selectedFilters,
  setSelectedFilters,
}: Props) {
  const t = useTranslations("customerManagement.buyer.filters");
  const countries = [
    { value: "all", label: "All countries" },
    ...useCountries().countries,
  ];

  return (
    <div className={"flex flex-col gap-4 sm:flex-row sm:items-center"}>
      <div>
        <DateRangePicker
          className={"rounded-full"}
          placeholder={t("dateRange")}
          from={selectedFilters.from ?? undefined}
          to={selectedFilters.to ?? undefined}
          onDateChange={(range) => {
            void setSelectedFilters({
              from: range.from,
              to: range.to,
            });
          }}
          onClear={() => {
            void setSelectedFilters({
              from: null,
              to: null,
            });
          }}
        />
      </div>
      <div>
        {selectedFilters.country === "all" ? (
          <SearchableDropdown
            className={"rounded-full"}
            searchOuterClassName={"rounded-full"}
            defaultValue={selectedFilters.country}
            placeholder={t("selectCountry")}
            options={countries}
            contentClassName={"min-w-64"}
            onValueChange={(option) => {
              void setSelectedFilters({ country: option.value });
            }}
            renderDropdownItem={(option) => (
              <div className="flex items-center gap-4">
                {option.value !== "all" && (
                  <FlagComponent countryCode={option.code} />
                )}
                <p>{option.label}</p>
              </div>
            )}
            renderValue={(option) => (
              <div className="flex items-center gap-4">
                <IconWorldPin className={"size-4"} color={"#161D14"} />
                <p>{option?.label}</p>
              </div>
            )}
          />
        ) : (
          <Badge className="flex h-10 items-center gap-2 bg-secondary px-3 font-normal text-secondary-foreground hover:bg-secondary/80">
            <span className="capitalize">{selectedFilters.country}</span>
            <button
              onClick={() => setSelectedFilters({ country: "all" })}
              className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
            >
              <X className="size-3 text-white" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
}
