"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { ChevronRight } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

const SliderRoot = SliderPrimitive.Root;
const SliderTrack = SliderPrimitive.Track;
const SliderRange = SliderPrimitive.Range;
const SliderThumb = SliderPrimitive.Thumb;

interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  width?: string;
  trackColor?: string;
  rangeColor?: string;
  thumbColor?: string;
  thumbHoverColor?: string;
  ariaLabel?: string;
  labelText?: string;
  onComplete?: () => void; // callback on slide complete
}

const CustomSlider: React.FC<SliderProps> = ({
  value,
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  width = "w-[300px]",
  trackColor = "bg-gray-300",
  rangeColor = "bg-primary",
  ariaLabel = "Slide to open",
  labelText = "Slide to open",
  onComplete,
}) => {
  const [sliderValue, setSliderValue] = useState<number[]>(defaultValue);

  // Navigate when value reaches max
  useEffect(() => {
    if (sliderValue[0] !== undefined && sliderValue[0] >= max && onComplete) {
      onComplete();
    }
  }, [sliderValue, max, onComplete]);

  return (
    <SliderRoot
      className={`relative flex items-center select-none touch-none h-[60px] rounded-full p-1 ${width}`}
      value={value ?? sliderValue}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      onValueChange={(val) => {
        setSliderValue(val);
        onValueChange?.(val);
      }}
    >
      <SliderTrack className={`relative grow rounded-2xl h-full ${trackColor}`}>
        <SliderRange className={`absolute h-full rounded-2xl  ${rangeColor}`} />
      </SliderTrack>

      <SliderThumb
        className={`flex items-center justify-center w-[150px] h-[52px] bg-primary rounded-2xl shadow-lg text-white font-semibold text-base cursor-grab active:cursor-grabbing transition-all duration-200`}
        aria-label={ariaLabel}
      >
        <span className="flex items-center gap-2">
          {labelText}
          <ChevronRight className="w-4 h-4" />
        </span>
      </SliderThumb>
    </SliderRoot>
  );
};

export default CustomSlider;
