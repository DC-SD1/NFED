"use client";

import { Badge } from "@cf/ui";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import PrimaryButton from "@/components/buttons/primary-button";
import DropdownComponent from "@/components/input-components/dropdown-component";
import InputComponent from "@/components/input-components/input-component";
import { SearchableDropdown } from "@/components/input-components/searchable-dropdown";
import useTableStore from "@/lib/stores/table-store/table-store";
import { UserShareAlternative, UserXAlternative } from "@/utils/svg-icons";

const GROWER_TYPES = [
  {
    label: "All grower type",
    value: "all",
  },
  {
    label: "Smallholder",
    value: "Smallholder",
  },
  {
    label: "Formal",
    value: "Formal",
  },
];

const FULFILLMENT_CENTERS = [
  { value: "all", label: "All fulfilment centers" },
  { value: "Juapong fulfilment center", label: "Juapong fulfilment center" },
  { value: "Kumasi Agro-Processing Hub", label: "Kumasi Agro-Processing Hub" },
  {
    value: "Sunyani Distribution Point",
    label: "Sunyani Distribution Point",
  },
  {
    value: "Takoradi Coastal Depot",
    label: "Takoradi Coastal Depot",
  },
  {
    value: "Tamale Northern Hub",
    label: "Tamale Northern Hub",
  },
  {
    value: "Ho Volta Region Center",
    label: "Ho Volta Region Center",
  },
  {
    value: "Cape Coast Collection Point",
    label: "Cape Coast Collection Point",
  },
  {
    value: "Accra Central Warehouse",
    label: "Accra Central Warehouse",
  },
];

type FilterField = "center" | "growerType";

interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  growerType: string;
  setGrowerType: (value: React.SetStateAction<string>) => void;
  selectedFulfillmentCenter: string;
  setSelectedFulfillmentCenter: (value: React.SetStateAction<string>) => void;
}

export default function AgentFarmersTableToolbar({
  searchTerm,
  setSearchTerm,
  growerType,
  setGrowerType,
  selectedFulfillmentCenter,
  setSelectedFulfillmentCenter,
}: Props) {
  const t = useTranslations(
    "customerManagement.agents.details.farmersTab.filters",
  );
  const { rows } = useTableStore();
  const handleRemoveFilter = (field: FilterField) => {
    if (field === "center") {
      setSelectedFulfillmentCenter("all");
    } else if (field === "growerType") {
      setGrowerType("all");
    }
  };

  return (
    <>
      {rows.length === 0 ? (
        <div
          className={"flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2"}
        >
          <div>
            <InputComponent
              key={"searchTerm"}
              type="search"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              placeholder={t("searchPlaceholder")}
              className={"min-w-64 rounded-full"}
              left={<Search className={"size-4"} />}
            />
          </div>
          <div>
            {growerType === "all" ? (
              <DropdownComponent
                className={"rounded-full"}
                defaultValue={growerType}
                options={GROWER_TYPES}
                placeholder={t("selectGrowerType")}
                contentClassName={"min-w-48"}
                onValueChange={(value) => {
                  setGrowerType(value);
                }}
              />
            ) : (
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
                <span className="capitalize">{growerType}</span>
                <button
                  onClick={() => handleRemoveFilter("growerType")}
                  className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
                >
                  <X className="size-3 text-white" />
                </button>
              </Badge>
            )}
          </div>
          <div>
            {selectedFulfillmentCenter === "all" ? (
              <SearchableDropdown
                className={"rounded-full"}
                searchOuterClassName={"rounded-full"}
                defaultValue={selectedFulfillmentCenter}
                placeholder={t("searchCenters")}
                options={FULFILLMENT_CENTERS}
                contentClassName={"min-w-64"}
                onValueChange={(option) => {
                  setSelectedFulfillmentCenter(option.value);
                }}
              />
            ) : (
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
                <span className="capitalize">{selectedFulfillmentCenter}</span>
                <button
                  onClick={() => handleRemoveFilter("center")}
                  className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
                >
                  <X className="size-3 text-white" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <div className={"flex items-center gap-2"}>
          <PrimaryButton
            variant={"secondary"}
            size="sm"
            className={"text-success-secondary text-sm font-semibold"}
            buttonContent={
              <>
                <UserShareAlternative size={"16"} fill={"#1A5514"} />
                {t("reassignFarmers", { count: rows.length })}
              </>
            }
          />
          <PrimaryButton
            variant={"secondary"}
            size="sm"
            className={"text-error-color text-sm font-semibold"}
            buttonContent={
              <>
                <UserXAlternative />
                {t("suspendFarmers", { count: rows.length })}
              </>
            }
          />
        </div>
      )}
    </>
  );
}
