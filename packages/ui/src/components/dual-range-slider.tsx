import React, { useCallback, useRef, useState } from "react";

interface DualRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  initialMinValue?: number;
  initialMaxValue?: number;
  prefix?: string;
  suffix?: string;
  minLabel?: string;
  maxLabel?: string;
  onChange?: (values: { min: number; max: number }) => void;
  className?: string;
}

type DragType = "min" | "max" | null;

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min = 0,
  max = 1000,
  step = 1,
  initialMinValue = 0,
  initialMaxValue = 1000,
  prefix = "",
  suffix = "",
  minLabel = "Min salary",
  maxLabel = "Max salary",
  onChange = () => {
    // Default no-op function
  },
  className = "",
}) => {
  const [minValue, setMinValue] = useState<number>(initialMinValue);
  const [maxValue, setMaxValue] = useState<number>(initialMaxValue);
  const [isDragging, setIsDragging] = useState<DragType>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (value: number): number =>
    ((value - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback(
    (clientX: number): number => {
      if (!sliderRef.current) return min;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(100, ((clientX - rect.left) / rect.width) * 100),
      );
      const value = min + (percentage / 100) * (max - min);

      return Math.round(value / step) * step;
    },
    [max, min, sliderRef, step],
  );

  // Extract clientX from either mouse or touch event
  const getClientX = (e: MouseEvent | TouchEvent): number => {
    if ("touches" in e) {
      return e.touches[0]?.clientX ?? 0;
    }
    return e.clientX;
  };

  const handleStart =
    (type: DragType) => (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(type);
      e.preventDefault();
    };

  const handleKeyDown = (type: DragType) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsDragging(type);
      e.preventDefault();
    }
  };

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      const clientX = getClientX(e);
      const newValue = getValueFromPosition(clientX);

      if (isDragging === "min") {
        const clampedValue = Math.max(min, Math.min(newValue, maxValue));
        if (clampedValue !== minValue) {
          setMinValue(clampedValue);
          onChange({ min: clampedValue, max: maxValue });
        }
      } else if (isDragging === "max") {
        const clampedValue = Math.min(max, Math.max(newValue, minValue));
        if (clampedValue !== maxValue) {
          setMaxValue(clampedValue);
          onChange({ min: minValue, max: clampedValue });
        }
      }
    },
    [isDragging, min, max, minValue, maxValue, getValueFromPosition, onChange],
  );

  const handleEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      // Add both mouse and touch event listeners
      const handleMouseMove = (e: MouseEvent) => handleMove(e);
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Prevent scrolling while dragging
        handleMove(e);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleEnd);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  const minPercentage = getPercentage(minValue);
  const maxPercentage = getPercentage(maxValue);

  return (
    <div className={`w-full ${className}`}>
      {/* Slider Track Container */}
      <div className="relative mb-6">
        {/* Value Labels Above Handles - Only show when dragging */}
        {isDragging && (
          <div className="absolute -top-16 w-full">
            {(isDragging === "min" || isDragging === "max") && (
              <>
                <div
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${minPercentage}%` }}
                >
                  <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold relative">
                    {prefix}
                    {minValue}
                    {suffix}
                    {/* Antenna line */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-primary"></div>
                  </div>
                </div>
                <div
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${maxPercentage}%` }}
                >
                  <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold relative">
                    {prefix}
                    {maxValue}
                    {suffix}
                    {/* Antenna line */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-primary"></div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Slider Track */}
        <div
          ref={sliderRef}
          className="relative h-1 bg-gray-300 cursor-pointer"
          role="group"
          aria-label="Dual range slider"
        >
          {/* Active Range */}
          <div
            className="absolute h-full bg-primary"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
            }}
          />

          {/* Min Handle */}
          <div
            className={`shadow-lg absolute w-8 h-8 ${isDragging === "min" ? "bg-primary" : "bg-white"} rounded-full cursor-grab active:cursor-grabbing transform -translate-y-3 -translate-x-2 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 touch-none select-none`}
            style={{ left: `${minPercentage}%` }}
            onMouseDown={handleStart("min")}
            onTouchStart={handleStart("min")}
            onKeyDown={handleKeyDown("min")}
            role="slider"
            tabIndex={0}
            aria-label={`Minimum value: ${prefix}${minValue}${suffix}`}
            aria-valuemin={min}
            aria-valuemax={maxValue}
            aria-valuenow={minValue}
          />

          {/* Max Handle */}
          <div
            className={`shadow-lg absolute w-8 h-8 ${isDragging === "max" ? "bg-primary" : "bg-white"} rounded-full cursor-grab active:cursor-grabbing transform -translate-y-3 -translate-x-2 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 touch-none select-none`}
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={handleStart("max")}
            onTouchStart={handleStart("max")}
            onKeyDown={handleKeyDown("max")}
            role="slider"
            tabIndex={0}
            aria-label={`Maximum value: ${prefix}${maxValue}${suffix}`}
            aria-valuemin={minValue}
            aria-valuemax={max}
            aria-valuenow={maxValue}
          />
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="w-full text-sm  text-start px-2 py-2 font-thin border border-gray-semi-dark rounded-xl bg-white">
            <label className="block mb-1 text-gray-dark text-xs font-normal">
              {minLabel}
            </label>
            {prefix}
            {minValue}
            {suffix}
          </div>
        </div>

        <div className="space-y-3">
          <div className="w-full text-sm  text-start px-2 py-2 font-thin border border-gray-semi-dark rounded-xl bg-white">
            <label className="block mb-1 text-gray-dark text-xs font-normal">
              {maxLabel}
            </label>
            {prefix}
            {maxValue}
            {suffix}
          </div>
        </div>
      </div>
    </div>
  );
};
