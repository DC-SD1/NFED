import { Checkbox } from "@cf/ui";
import { FormDateInput } from "@cf/ui/components/form-date-time";
import { Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";
import { useFormContext } from "react-hook-form";

interface PreferencesSectionProps {
  useIrrigation: boolean;
  onIrrigationChange: (value: boolean) => void;
}

export const PreferencesSection = memo(
  ({ useIrrigation, onIrrigationChange }: PreferencesSectionProps) => {
    const t = useTranslations("farmPlan.productionPlan");
    const { control } = useFormContext();

    return (
      <>
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-2">
          <div className="w-full">
            <label
              htmlFor="start-date"
              className="mb-2 block text-sm font-semibold"
            >
              {t("preferredStartDate")}
            </label>
            <div className="relative">
              <FormDateInput
                name="startDate"
                control={control}
                className="border-input-border w-full"
                bgColor="bg-userDropdown-background"
              />
              <Calendar className="text-gray-dark pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2" />
            </div>
          </div>
          <div className="hidden lg:block" />
        </div>

        <div className="mb-8 mt-6">
          <label className="flex cursor-pointer items-center space-x-3">
            <Checkbox
              checked={useIrrigation}
              onCheckedChange={(value) => onIrrigationChange(value === true)}
              className="border-gray-dark size-10 rounded text-green-600 focus:ring-2 focus:ring-green-500"
            />
            <span className="text-md font-thin">{t("useIrrigation")}</span>
          </label>
        </div>
      </>
    );
  },
);

PreferencesSection.displayName = "PreferencesSection";
