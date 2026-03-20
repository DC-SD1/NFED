import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

interface CropSelectionSectionProps {
  cropTypes: string[];
  varieties: { id?: string; name?: string }[];
  selectedCropType: string;
  selectedVariety: string;
  onCropTypeChange: (value: string) => void;
  onVarietyChange: (value: string) => void;
  isEditMode?: boolean;
}

export const CropSelectionSection = memo(
  ({
    cropTypes,
    varieties,
    selectedCropType,
    selectedVariety,
    onCropTypeChange,
    onVarietyChange,
    isEditMode = false,
  }: CropSelectionSectionProps) => {
    const t = useTranslations("farmPlan.productionPlan");

    return (
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Crop Type Dropdown */}
        <div className="w-full">
          <label
            htmlFor="crop-type-select"
            className="mb-4 text-sm font-semibold"
          >
            {t("cropType")} *
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                id="crop-type-select"
                type="button"
                disabled={isEditMode}
                className={`border-input-border flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isEditMode
                    ? "cursor-not-allowed bg-gray-100"
                    : "bg-userDropdown-background"
                }`}
              >
                <span
                  className={selectedCropType ? "font-thin" : "text-gray-dark"}
                >
                  {selectedCropType || t("selectCropType")}
                </span>
                <ChevronDown className="size-6 font-thin" />
              </button>
            </DropdownMenuTrigger>
            {!isEditMode && (
              <DropdownMenuContent
                align="start"
                className="z-10 max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto rounded-2xl border-none bg-white p-3 shadow-xl"
              >
                {cropTypes.length > 0 ? (
                  cropTypes.map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => onCropTypeChange(option)}
                      className="bg-userDropdown-background hover:none mb-2 cursor-pointer rounded-xl p-3"
                    >
                      {option}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-500">
                    No crop types available
                  </div>
                )}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>

        {/* Crop Variety Dropdown */}
        <div className="w-full">
          <label
            htmlFor="crop-variety-select"
            className="mb-4 text-sm font-semibold"
          >
            {t("cropVariety")} *
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                id="crop-variety-select"
                type="button"
                disabled={!selectedCropType}
                className={`border-input-border flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  // !selectedCropType
                  //   ? "cursor-not-allowed bg-gray-100"
                  //   : "bg-userDropdown-background"
                  "bg-userDropdown-background"
                }`}
              >
                <span
                  className={selectedVariety ? "font-thin" : "text-gray-dark"}
                >
                  {selectedVariety || t("selectCropVariety")}
                </span>
                <ChevronDown className="size-6 font-thin" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="z-10 max-h-60 w-[--radix-dropdown-menu-trigger-width] overflow-y-auto rounded-2xl border-none bg-white p-3 shadow-xl"
            >
              {varieties.map((variety) => (
                <DropdownMenuItem
                  key={variety.id}
                  onClick={() => onVarietyChange(variety.name || "")}
                  className="bg-userDropdown-background hover:none mb-2 cursor-pointer rounded-xl p-3"
                >
                  {variety.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  },
);

CropSelectionSection.displayName = "CropSelectionSection";
