"use client";

import { cn } from "@cf/ui";

interface Props {
  title: string;
  stats: { status: string; amount: string; valueClassName?: string }[];
  icon: React.ReactNode;
  iconContainerClassName?: string;
}

export default function AgentOverviewDoubleCard({
  title,
  stats,
  icon: Icon,
  iconContainerClassName,
}: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2.5 py-1">
        <p className="text-sm font-bold">{title}</p>
        <div
          className={cn(
            "rounded-md bg-[#F3F6F3] p-1.5",
            iconContainerClassName,
          )}
        >
          {Icon}
        </div>
      </div>
      <div className={"grid grid-cols-2 gap-5 py-1"}>
        {stats.map((item, index) => (
          <div
            className={cn(
              "col-span-1 flex flex-col gap-1.5 border-r border-dashed border-r-[#73796E]",
              index === stats.length - 1 && "border-0",
            )}
            key={index}
          >
            <p className={cn("font-bold", item.valueClassName)}>
              {item.amount}
            </p>
            <p className="text-xs">{item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
