import { useTranslations } from "next-intl";

import FocusCropSelectionForm from "./focus-crop-selection";
import CropSelectionForm from "./select-crop-form";

export default function SelectGrowOption() {
  const t = useTranslations("dashboard.grow");

  return (
    <div className="flex flex-col items-center justify-center  py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        <div className="mb-6 space-y-3 text-center sm:mb-8">
          <p className="text-muted-foreground text-start text-sm sm:text-center ">
            {t("selectSub")}
          </p>
        </div>

        <div className="flex-col items-center justify-center gap-4 sm:gap-6 lg:gap-8">
          <CropSelectionForm />

          <FocusCropSelectionForm />
        </div>
      </div>
    </div>
  );
}
