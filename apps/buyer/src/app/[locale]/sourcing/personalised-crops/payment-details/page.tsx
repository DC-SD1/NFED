import { useTranslations } from "next-intl";

import { PaymentDetailsForm } from "./_components/payment-details-form";

export default function PaymentDetailsPage() {
  const t = useTranslations();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h4 className="text-[36px] font-bold">
          {t("sourcing.paymentDetails.page.title")}
        </h4>
        <p className="text-sm text-[#586665]">
          {t("sourcing.paymentDetails.page.subtitle")}
        </p>
      </div>

      <PaymentDetailsForm />
    </div>
  );
}
