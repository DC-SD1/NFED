import { FormControl, FormField, FormItem, FormLabel } from "@cf/ui";
import { useFormContext } from "react-hook-form";

import { Slider } from "../ui/slider";

interface SliderFormProps {
  name: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

export const SliderForm = ({
  name,
  label,
  min = 30,
  max = 100,
  step = 10,
}: SliderFormProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Ensure we always have a valid array value
        const currentValue = Array.isArray(field.value) ? field.value : [30];

        // Convert the actual value to a 0-based slider value for proper positioning
        const sliderValue = currentValue.map((val) => val - min);
        const sliderMax = max - min;

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Slider
                className="bg-[#6F7978]"
                min={0}
                max={sliderMax}
                step={step}
                value={sliderValue}
                onValueChange={(values) => {
                  // Convert back to actual values
                  const actualValues = values.map((val) => val + min);
                  field.onChange(actualValues);
                }}
              />
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
};
