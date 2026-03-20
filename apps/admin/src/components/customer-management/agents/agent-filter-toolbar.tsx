"use client";

import { Badge } from "@cf/ui";
import { IconMap2, IconWorldPin } from "@tabler/icons-react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ParserBuilder, SetValues } from "nuqs";
import React from "react";

import FlagComponent from "@/components/common/flag-component";
import DateRangePicker from "@/components/input-components/date-range-picker";
import DropdownComponent from "@/components/input-components/dropdown-component";
import { SearchableDropdown } from "@/components/input-components/searchable-dropdown";

const REGIONS = [
  { value: "all", label: "All regions" },
  {
    value: "Greater Accra Region",
    label: "Greater Accra Region",
  },
  {
    value: "Ashanti Region",
    label: "Ashanti Region",
  },
  {
    value: "Western Region",
    label: "Western Region",
  },
  {
    value: "Eastern Region",
    label: "Eastern Region",
  },
  {
    value: "Northern Region",
    label: "Northern Region",
  },
  {
    value: "Central Region",
    label: "Central Region",
  },
  {
    value: "Volta Region",
    label: "Volta Region",
  },
  {
    value: "Western North Region",
    label: "Western North Region",
  },
  {
    value: "Upper West Region",
    label: "Upper West Region",
  },
];
const COUNTRIES = [
  { value: "all", label: "All countries" },
  {
    value: "Ghana",
    label: "Ghana",
    code: "GH",
  },
  {
    value: "Togo",
    label: "Togo",
    code: "TG",
  },
  {
    value: "Côte d'Ivoire",
    label: "Côte d'Ivoire",
    code: "CI",
  },
];

interface Props {
  selectedFilters: {
    from: Date | null;
    to: Date | null;
    country: string;
    region: string;
  };
  setSelectedFilters: SetValues<{
    from: ParserBuilder<Date>;
    to: ParserBuilder<Date>;
    country: Omit<ParserBuilder<string>, "parseServerSide"> & {
      parseServerSide: (value: string) => string;
    };
    region: Omit<ParserBuilder<string>, "parseServerSide"> & {
      parseServerSide: (value: string) => string;
    };
  }>;
}

export default function AgentFilterToolbar({
  selectedFilters,
  setSelectedFilters,
}: Props) {
  const t = useTranslations("customerManagement.agents.filters");

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
          <DropdownComponent
            className={"rounded-full"}
            defaultValue={selectedFilters.country}
            placeholder={t("selectCountry")}
            options={COUNTRIES}
            contentClassName={"min-w-64"}
            onValueChange={(value) => {
              void setSelectedFilters({ country: value });
            }}
            renderLabel={(option) => (
              <div className="flex items-center gap-4">
                {option.value !== "all" && (
                  <FlagComponent countryCode={option.code} />
                )}
                <p>{option.label}</p>
              </div>
            )}
            renderValue={(option) => (
              <div className="mr-1.5 flex items-center gap-4">
                <IconWorldPin className={"size-4"} color={"#161D14"} />
                <p>{option?.label}</p>
              </div>
            )}
          />
        ) : (
          <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
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
      <div>
        {selectedFilters.region === "all" ? (
          <SearchableDropdown
            className={"rounded-full"}
            searchOuterClassName={"rounded-full"}
            defaultValue={selectedFilters.region}
            placeholder={t("selectRegion")}
            options={REGIONS}
            contentClassName={"min-w-64"}
            onValueChange={(option) => {
              void setSelectedFilters({ region: option.value });
            }}
            renderValue={(option) => (
              <div className="mr-2 flex items-center gap-4">
                <IconMap2 className={"size-4"} color={"#161D14"} />
                <p>{option?.label}</p>
              </div>
            )}
          />
        ) : (
          <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
            <span className="capitalize">{selectedFilters.region}</span>
            <button
              onClick={() => setSelectedFilters({ region: "all" })}
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
