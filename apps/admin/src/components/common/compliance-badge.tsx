"use client";

import { Badge, cn } from "@cf/ui";
import React from "react";

import { COMPLIANCE_STATUS } from "@/utils/constants/status-constants";

interface Props {
  compliance: string;
  className?: string;
}

const ComplianceBadge = ({ compliance, className }: Props) => {
  const complianceStatus = compliance.toUpperCase();

  const complianceConfig: Record<
    string,
    {
      bgColor: string;
      textColor: string;
      hoverBgColor: string;
      hoverTextColor: string;
      borderColor: string;
      label: string;
    }
  > = {
    [COMPLIANCE_STATUS.lowRisk]: {
      bgColor: "bg-[#C9F0D6]",
      textColor: "text-[#00572D]",
      hoverBgColor: "hover:bg-[#C9F0D6]",
      hoverTextColor: "hover:text-[#00572D]",
      borderColor: "border-[#C9F0D6]",
      label: COMPLIANCE_STATUS.lowRisk,
    },

    [COMPLIANCE_STATUS.highRisk]: {
      bgColor: "bg-[#FFDAD6]",
      textColor: "text-[#8F0004]",
      hoverBgColor: "hover:bg-[#FFDAD6]",
      hoverTextColor: "hover:text-[#8F0004]",
      borderColor: "border-[#FFDAD6]",
      label: COMPLIANCE_STATUS.highRisk,
    },
    [COMPLIANCE_STATUS.notAssigned]: {
      bgColor: "bg-[#FFFFFF]",
      textColor: "text-[#525C4E]",
      hoverBgColor: "hover:bg-[#FFFFFF]",
      hoverTextColor: "hover:text-[#525C4E]",
      borderColor: "border-[#E5E8DF]",
      label: COMPLIANCE_STATUS.notAssigned,
    },
    [COMPLIANCE_STATUS.prohibited]: {
      bgColor: "bg-[#73796E]",
      textColor: "text-[#EBF3E3]",
      hoverBgColor: "hover:bg-[#73796E]",
      hoverTextColor: "hover:text-[#EBF3E3]",
      borderColor: "border-[#73796E]",
      label: COMPLIANCE_STATUS.prohibited,
    },
  };

  const config =
    complianceConfig[complianceStatus] ||
    complianceConfig[COMPLIANCE_STATUS.notAssigned];

  return (
    <Badge
      className={cn(
        "flex w-fit items-center gap-1 rounded-md border px-1.5 text-xs font-normal",
        config?.bgColor,
        config?.textColor,
        config?.hoverBgColor,
        config?.hoverTextColor,
        config?.borderColor,
        className,
      )}
    >
      {config?.label}
    </Badge>
  );
};

export default ComplianceBadge;
