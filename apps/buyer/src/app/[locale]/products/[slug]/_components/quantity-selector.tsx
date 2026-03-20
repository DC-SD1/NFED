"use client";

import { Button, Input } from "@cf/ui";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";

/**
 * Props for the QuantitySelector component
 */
export interface QuantitySelectorProps {
  /** Current quantity value (default: 0) */
  value?: number;
  /** Callback function called when quantity changes */
  onChange?: (value: number) => void;
  /** Minimum allowed quantity (default: 0) */
  min?: number;
  /** Maximum allowed quantity (optional) */
  max?: number;
  /** Whether the component is disabled (default: false) */
  disabled?: boolean;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Whether to show validation errors */
  showValidationErrors?: boolean;
}

/**
 * QuantitySelector component for selecting quantity in metric tonnes.
 *
 * This component provides a user-friendly interface for selecting quantities with
 * proper validation, increment/decrement controls, and direct input capability.
 *
 * @example
 * ```tsx
 * <QuantitySelector
 *   value={0}
 *   onChange={(value) => console.log("Quantity:", value)}
 *   min={0}
 *   max={30000}
 *   disabled={false}
 * />
 * ```
 */
export function QuantitySelector({
  value = 0,
  onChange,
  min = 0,
  max,
  disabled = false,
  className = "",
  showValidationErrors: _ = false,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(value);
  const [inputValue, setInputValue] = useState(value.toString());
  const [hasError, setHasError] = useState(false);

  // Sync internal state with external value prop
  useEffect(() => {
    setQuantity(value);
    setInputValue(value.toString());
  }, [value]);

  /**
   * Validates a quantity value
   */
  const validateQuantity = (val: number): boolean => {
    if (val < min) return false;
    if (max !== undefined && val > max) return false;
    return true;
  };

  /**
   * Handles quantity increment
   */
  const handleIncrement = () => {
    const newValue = quantity + 1;
    if (validateQuantity(newValue)) {
      setQuantity(newValue);
      setInputValue(newValue.toString());
      setHasError(false);
      onChange?.(newValue);
    } else {
      setHasError(true);
    }
  };

  /**
   * Handles quantity decrement
   */
  const handleDecrement = () => {
    const newValue = quantity - 1;
    if (validateQuantity(newValue)) {
      setQuantity(newValue);
      setInputValue(newValue.toString());
      setHasError(false);
      onChange?.(newValue);
    } else {
      setHasError(true);
    }
  };

  /**
   * Handles direct input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    // Allow empty input for user typing experience
    if (inputVal === "") {
      setHasError(false);
      return;
    }

    const numericValue = parseInt(inputVal);

    // Check if input is a valid number
    if (isNaN(numericValue)) {
      setHasError(true);
      return;
    }

    // Validate the numeric value
    if (validateQuantity(numericValue)) {
      setQuantity(numericValue);
      setHasError(false);
      onChange?.(numericValue);
    } else {
      setHasError(true);
    }
  };

  /**
   * Handles input blur - commits the value or resets if invalid
   */
  const handleInputBlur = () => {
    if (hasError || inputValue === "") {
      // Reset to last valid quantity
      setInputValue(quantity.toString());
      setHasError(false);
    }
  };

  /**
   * Handles input key press for Enter key
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-white">
        <p className="text-sm font-bold md:text-base">Select quantity</p>
        <p className="text-xs md:text-sm">(in metric tonnes)</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleDecrement}
          disabled={disabled || quantity <= min}
          className="h-[36px] w-[36px] rounded-full bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] disabled:opacity-50"
        >
          <IconMinus className="!size-4" />
        </Button>
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          min={min}
          max={max}
          className={`
            h-[36px] w-[70px] appearance-none rounded-xl text-center
            text-[hsl(var(--text-dark))]
            [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
            ${
              hasError
                ? "border-red-300 bg-red-100 text-red-700"
                : "bg-[#F5F5F5]"
            }`}
          placeholder="0"
        />
        <Button
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && quantity >= max)}
          className="h-[36px] w-[36px] rounded-full bg-[#F5F5F5] text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] disabled:opacity-50"
        >
          <IconPlus className="!size-4" />
        </Button>
      </div>
    </div>
  );
}
