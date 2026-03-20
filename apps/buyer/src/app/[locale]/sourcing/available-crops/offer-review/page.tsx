import { useTranslations } from "next-intl";

import OfferReviewSummary from "./_components/offer-review-summary";
import ViewInvoiceButton from "./_components/view-invoice-button";

export default function OfferReviewPage() {
  const t = useTranslations();

  return (
    <div className="space-y-10">
      <div className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <h4 className="text-[36px] font-bold">
            {t("sourcing.offerReview.title")}
          </h4>
          <p className="text-sm text-[#586665]">
            {t("sourcing.offerReview.description")}
          </p>
        </div>
        <ViewInvoiceButton />
      </div>

      <OfferReviewSummary />
    </div>
  );
}
