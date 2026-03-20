import { useTranslations } from "next-intl";

import CropSpecificationForm from "./_components/crop-specification-form";

export default function CropSpecificationPage() {
  const t = useTranslations();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h4 className="text-[36px] font-bold">
          {t("sourcing.availableCrops.cropSpecification.page.title")}
        </h4>
        <p className="text-sm text-[#586665]">
          {t("sourcing.availableCrops.cropSpecification.page.subtitle")}
        </p>
      </div>

      <CropSpecificationForm />
    </div>
  );
}
