"use client";

import { Badge } from "@cf/ui";
import { Search, X } from "lucide-react";
import React from "react";

import DropdownComponent from "@/components/input-components/dropdown-component";
import InputComponent from "@/components/input-components/input-component";
import useTableStore from "@/lib/stores/table-store/table-store";

interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: React.SetStateAction<string>) => void;
}

export default function CenterAgentTableToolbar({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
}: Props) {
  const { rows } = useTableStore();
  const handleRemoveFilter = () => {
    setSelectedStatus("all");
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
              placeholder={"Search by agent name"}
              className={"min-w-64 rounded-full"}
              left={<Search className={"size-4"} />}
            />
          </div>
          <div>
            {selectedStatus === "all" ? (
              <DropdownComponent
                className={"rounded-full"}
                defaultValue={selectedStatus}
                options={[
                  { label: "All status", value: "all" },
                  { label: "Active", value: "Active" },
                  { label: "Deactivated", value: "Deactivated" },
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
                  onClick={handleRemoveFilter}
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
