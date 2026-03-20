"use client";

import { Button } from "@cf/ui";
import { IconPlant2 } from "@tabler/icons-react";
import { useCallback, useState } from "react";

import { QuantitySelector } from "./quantity-selector";

/**
 * Props for the QuantityCard component
 */
export interface QuantityCardProps {
  /** Maximum available quantity in metric tonnes */
  maxQuantity?: number;
  /** Callback function called when sourcing begins */
  onBeginSourcing?: (quantity: number) => void;
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Custom CSS classes for the container */
  className?: string;
}

/**
 * QuantityCard component for displaying available quantity and allowing users to select
 * their desired quantity for sourcing.
 *
 * This component provides validation to ensure users cannot select more than the available
 * quantity and includes proper button state management.
 *
 * @example
 * ```tsx
 * <QuantityCard
 *   maxQuantity={30000}
 *   onBeginSourcing={(quantity) => console.log("Selected quantity:", quantity)}
 * />
 * ```
 */
export function QuantityCard({
  maxQuantity = 30000,
  onBeginSourcing,
  disabled = false,
  className = "",
}: QuantityCardProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  /**
   * Handles quantity change with validation
   */
  const handleQuantityChange = useCallback(
    (value: number) => {
      setSelectedQuantity(value);

      // Validate quantity
      const isValid = value > 0 && value <= maxQuantity;
      setHasError(!isValid && value > 0);
    },
    [maxQuantity],
  );

  /**
   * Handles begin sourcing button click
   */
  const handleBeginSourcing = useCallback(() => {
    if (selectedQuantity > 0 && selectedQuantity <= maxQuantity) {
      onBeginSourcing?.(selectedQuantity);
    }
  }, [selectedQuantity, maxQuantity, onBeginSourcing]);

  // Button should be disabled if:
  // 1. No quantity selected (0 or less)
  // 2. Quantity exceeds maximum available
  // 3. Component is disabled via props
  // 4. There's a validation error
  const isButtonDisabled =
    disabled ||
    selectedQuantity <= 0 ||
    selectedQuantity > maxQuantity ||
    hasError;

  // Format the available quantity for display
  const formatQuantity = (quantity: number) => {
    return quantity.toLocaleString();
  };

  return (
    <div
      className={`bg-gradient flex h-[224px] w-full flex-col justify-between rounded-xl bg-gradient-to-tr from-[hsl(var(--text-dark))] via-[#00554A] to-[#4B908B] p-4 ${className}`}
    >
      <div className="bg-primary flex w-max items-center gap-1.5 rounded-xl p-2 text-white">
        <IconPlant2 className="!size-4" />
        <p>{formatQuantity(maxQuantity)} MT Available</p>
      </div>

      <div className="space-y-2">
        <QuantitySelector
          value={selectedQuantity}
          onChange={handleQuantityChange}
          min={0}
          max={maxQuantity}
          disabled={disabled}
        />

        {/* Error message display */}
        {hasError && (
          <p className="text-sm text-red-300">
            Quantity cannot exceed {formatQuantity(maxQuantity)} MT
          </p>
        )}
      </div>

      <Button
        className="h-[56px] w-full rounded-xl text-base font-bold disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isButtonDisabled}
        onClick={handleBeginSourcing}
      >
        Begin sourcing
      </Button>
    </div>
  );
}
