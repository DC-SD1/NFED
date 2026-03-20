"use client";

import { clsx } from "clsx";

interface Props {
  id: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}

const RadioButton = ({
  id,
  name,
  value,
  checked,
  onChange,
  children,
}: Props) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={clsx(
            "flex size-6 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200",
            checked && "border-[#36B92E]",
          )}
        >
          {checked && (
            <div className="size-3.5 rounded-full bg-[#36B92E]"></div>
          )}
        </label>
      </div>
      {children && (
        <label htmlFor={id} className="cursor-pointer text-gray-700">
          {children}
        </label>
      )}
    </div>
  );
};

export default RadioButton;
