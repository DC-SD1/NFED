"use client";
import { Input } from "@cf/ui";
import { clsx } from "clsx";
import React from "react";

type ExtendableInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export default function InputComponent({
  className,
  left,
  right,
  ...props
}: ExtendableInputProps) {
  return (
    <div className={"relative w-full"}>
      <Input
        {...props}
        className={clsx(
          "border-input-border bg-input",
          left && "pl-9",
          right && "pr-9",
          className,
        )}
      />
      {left && (
        <div className={"absolute left-3 top-1/2 -translate-y-1/2"}>{left}</div>
      )}
      {right && (
        <div className={"absolute right-3 top-1/2 -translate-y-1/2"}>
          {right}
        </div>
      )}
    </div>
  );
}
