"use client";

import { Badge } from "@cf/ui";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Dispatch, SetStateAction } from "react";
import React, { useMemo } from "react";

import DropdownComponent from "@/components/input-components/dropdown-component";
import InputComponent from "@/components/input-components/input-component";
import {
  COMPLIANCE_STATUS,
  STATUSES,
} from "@/utils/constants/status-constants";

interface Props {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedStatus: string;
  setSelectedStatus: Dispatch<SetStateAction<string>>;
  selectedComplianceStatus: string;
  setSelectedComplianceStatus: Dispatch<SetStateAction<string>>;
}

export default function BuyerTableToolbar({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedComplianceStatus,
  setSelectedComplianceStatus,
}: Props) {
  const t = useTranslations("customerManagement.buyer.filters");

  const statusOptions = useMemo(
    () => [
      { label: "All statuses", value: "all" },
      { label: "Active", value: STATUSES.active },
      { label: "Pending", value: STATUSES.pending },
      { label: "Suspended", value: STATUSES.suspended },
      { label: "Deactivated", value: STATUSES.deactivated },
    ],
    [],
  );

  const complianceOptions = useMemo(
    () => [
      { label: "All compliance risks", value: "all" },
      { label: "Low Risk", value: COMPLIANCE_STATUS.lowRisk },
      { label: "High Risk", value: COMPLIANCE_STATUS.highRisk },
      { label: "Prohibited", value: COMPLIANCE_STATUS.prohibited },
      { label: "Not Assigned", value: COMPLIANCE_STATUS.notAssigned },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative">
          <InputComponent
            type="search"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={"min-w-[22rem] rounded-full"}
            left={<Search className={"size-4"} />}
          />
        </div>

        {selectedStatus !== "all" && (
          <Badge className="flex h-10 items-center gap-2 bg-secondary px-3 font-normal text-secondary-foreground hover:bg-secondary/80">
            <span className="capitalize">{selectedStatus}</span>
            <button
              onClick={() => setSelectedStatus("all")}
              className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
            >
              <X className="size-3 text-white" />
            </button>
          </Badge>
        )}

        {selectedComplianceStatus !== "all" && (
          <Badge className="flex h-10 items-center gap-2 bg-secondary px-3 font-normal text-secondary-foreground hover:bg-secondary/80">
            <span className="capitalize">
              {
                complianceOptions.find(
                  (opt) => opt.value === selectedComplianceStatus,
                )?.label
              }
            </span>
            <button
              onClick={() => setSelectedComplianceStatus("all")}
              className="flex size-4 cursor-pointer items-center justify-center rounded-full bg-[#161D14] p-1"
            >
              <X className="size-3 text-white" />
            </button>
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {selectedStatus === "all" && (
          <div key="status-dropdown">
            <DropdownComponent
              className={"rounded-full"}
              contentClassName={"min-w-64"}
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value);
              }}
              options={statusOptions}
              placeholder={t("selectStatus")}
            />
          </div>
        )}
        {selectedComplianceStatus === "all" && (
          <div key="compliance-dropdown">
            <DropdownComponent
              className={"rounded-full"}
              contentClassName={"min-w-64"}
              value={selectedComplianceStatus}
              onValueChange={(value) => {
                setSelectedComplianceStatus(value);
              }}
              options={complianceOptions}
              placeholder={t("selectComplianceStatus")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
