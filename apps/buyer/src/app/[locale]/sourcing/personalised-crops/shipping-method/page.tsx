import { useTranslations } from "next-intl";

import { ShippingMethodForm } from "./_components/shipping-method-form";

export default function ShippingMethodPage() {
  const t = useTranslations();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h4 className="text-[36px] font-bold">
          {t("sourcing.shippingMethod.page.title")}
        </h4>
        <p className="text-sm text-[#586665]">
          {t("sourcing.shippingMethod.page.subtitle")}
        </p>
      </div>
      <ShippingMethodForm />
    </div>
  );
}
