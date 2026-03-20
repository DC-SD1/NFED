"use client";

import { Badge } from "@cf/ui";
import { Search, X } from "lucide-react";
import React from "react";

import DropdownComponent from "@/components/input-components/dropdown-component";
import InputComponent from "@/components/input-components/input-component";
import useTableStore from "@/lib/stores/table-store/table-store";

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

type FilterField = "status" | "growerType";

interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  growerType: string;
  setGrowerType: (value: React.SetStateAction<string>) => void;
  selectedStatus: string;
  setSelectedStatus: (value: React.SetStateAction<string>) => void;
}

export default function CenterFarmlandTableToolbar({
  searchTerm,
  setSearchTerm,
  growerType,
  setGrowerType,
  selectedStatus,
  setSelectedStatus,
}: Props) {
  const { rows } = useTableStore();
  const handleRemoveFilter = (field: FilterField) => {
    if (field === "status") {
      setSelectedStatus("all");
    } else if (field === "growerType") {
      setGrowerType("all");
    }
  };

  return (
    <>
      {rows.length === 0 && (
        <div
          className={"flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2"}
        >
          <div>
            <InputComponent
              key={"searchTerm"}
              type="search"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              placeholder={"Search by farmland name"}
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
                placeholder={"Select grower type"}
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
            {selectedStatus === "all" ? (
              <DropdownComponent
                className={"rounded-full"}
                defaultValue={selectedStatus}
                options={[
                  { label: "All status", value: "all" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                placeholder={"Select status"}
                contentClassName={"min-w-48"}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                }}
              />
            ) : (
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-10 items-center gap-2 px-3 font-normal">
                <span className="capitalize">{selectedStatus}</span>
                <button
                  onClick={() => handleRemoveFilter("status")}
                  className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
                >
                  <X className="size-3 text-white" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </>
  );
}
