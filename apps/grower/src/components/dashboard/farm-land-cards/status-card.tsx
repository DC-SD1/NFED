import { Card, CardContent, cn } from "@cf/ui";
import { SmileUpIcon } from "@cf/ui/icons";
import { Frown, Meh, Smile } from "lucide-react";
import type { ReactNode } from "react";
import React from "react";

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: string;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
  interactive?: boolean;
}

const getStatusCardValues = (status: string): [string, ReactNode | null] => {
  switch (status.toLowerCase()) {
    case "very low":
      return [
        "text-destructive",
        <Frown key="frown-icon" className="text-destructive" />,
      ];
    case "low":
      return [
        "text-yellow-dark",
        <Meh key="meh-icon" className="text-yellow-dark" />,
      ];
    case "adequate":
      return [
        "text-primary-semi",
        <Smile key="smile-icon" className="text-primary-semi" />,
      ];
    case "high":
      return ["text-blue-semi", <SmileUpIcon key="smile-up-icon" />];
    default:
      return ["text-gray-600", null];
  }
};

export default function StatusCard({
  title,
  value,
  unit,
  status,
  className,
  onClick,
  isSelected = false,
  interactive = false,
}: StatusCardProps) {
  const isSoloValue = !unit && !status;

  return (
    <Card
      onClick={interactive ? onClick : undefined}
      className={cn(
        "w-full max-w-full rounded-lg border-0 drop-shadow-md transition-all",
        interactive && "cursor-pointer hover:scale-[1.02] hover:drop-shadow-lg",
        isSelected && "ring-primary ring-2 ring-offset-2",
        className
      )}
    >
      <div className="relative flex h-full min-h-[130px] flex-col p-2">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-gray-dark break-all text-xs font-thin">
            {title}
          </h3>
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full">
            {getStatusCardValues(status ?? "")[1]}
          </div>
        </div>

        <CardContent
          className={`grow overflow-hidden p-0 ${isSoloValue ? "flex items-end" : ""}`}
        >
          <div className="flex flex-wrap items-baseline gap-1 overflow-hidden">
            <span
              className={`font-bold ${
                isSoloValue ? "text-md sm:text-lg" : "text-2xl sm:text-3xl"
              }`}
            >
              {value}
            </span>
            {unit && (
              <span className="text-gray-dark break-all text-sm font-light">
                {unit}
              </span>
            )}
          </div>
        </CardContent>

        {status && (
          <div className="mt-auto flex justify-start pt-2">
            <div
              className={`break-all text-sm font-light ${
                getStatusCardValues(status ?? "")[0]
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
