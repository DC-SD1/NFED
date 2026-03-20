import { useTranslations } from "next-intl";

import SourcingSummary from "./_components/sourcing-summary";

export default function SourcingReviewPage() {
  const t = useTranslations();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h4 className="text-[36px] font-bold">
          {t("sourcing.sourcingReview.page.title")}
        </h4>
        <p className="text-sm text-[#586665]">
          {t("sourcing.sourcingReview.page.subtitle")}
        </p>
      </div>

      <SourcingSummary />
    </div>
  );
}
