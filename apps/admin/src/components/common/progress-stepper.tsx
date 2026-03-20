"use client";

import React from "react";

interface Props {
  progressList: {
    title: string;
    time: string;
    description: string;
  }[];
}

export default function ProgressStepper({ progressList }: Props) {
  return (
    <div className={"flex gap-4 py-2"}>
      <div className={"flex flex-col gap-1 pt-1"}>
        {Array.from({ length: progressList.length }).map((_, index) => (
          <React.Fragment key={index}>
            <div
              className={"size-2 rounded-full bg-[#71786C] text-xs text-white"}
            />
            {index !== progressList.length - 1 && (
              <div
                className={
                  "mx-auto h-10 border-r-2 border-dashed border-[#E5E8DF]"
                }
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className={"flex w-full flex-col gap-5"}>
        {progressList.map((item, index) => (
          <div className={"flex flex-col gap-1"} key={index}>
            <div className={"flex items-center justify-between gap-2"}>
              <p className={"text-xs"}>{item.title}</p>
              <p className={"text-xs"}>{item.time}</p>
            </div>
            <p className={"text-secondary-foreground text-xs"}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
