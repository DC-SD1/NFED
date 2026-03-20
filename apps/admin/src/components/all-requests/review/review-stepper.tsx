"use client";

import { cn } from "@cf/ui";
import { IconCheck } from "@tabler/icons-react";
import React from "react";

interface Props {
  step: number;
  steps: Record<number, { content: React.ReactNode; title: string }>;
}

export default function ReviewStepper({ step, steps }: Props) {
  const stepsLength = Object.keys(steps).length;

  return (
    <div className={"hidden w-[38%] border-r lg:block"}>
      <div className={"flex gap-4 py-10 pl-10 pr-4"}>
        <div>
          <div
            className={
              "flex w-fit flex-col gap-[1.6rem] rounded-full bg-[#EDF0E6] p-1"
            }
          >
            {Array.from({ length: stepsLength }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex size-5 items-center justify-center rounded-full bg-[#525C4E] text-xs text-white transition-all duration-200",
                  step === i + 1 && "bg-[#161D14]",
                  step > i + 1 && "bg-[#008744]",
                )}
              >
                {step > i + 1 ? <IconCheck className={"size-3"} /> : i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className={"flex w-full flex-col gap-6 xl:gap-[1.4rem]"}>
          {Object.values(steps).map((item, i) => (
            <p
              key={i}
              className={cn(
                "text-[15px] transition-all duration-200 xl:text-base",
                step >= i + 1 && "font-bold",
              )}
            >
              {item.title}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
